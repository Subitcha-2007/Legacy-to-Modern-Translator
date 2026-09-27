const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          cookies: res.headers['set-cookie']
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('--- STARTING COMPREHENSIVE WORKFLOW AUDIT ---');
  const auditResults = {};

  const uniqueId = Date.now();
  const testUserA = {
    name: 'Audit User Alpha',
    email: `audit.alpha.${uniqueId}@test.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  const testUserB = {
    name: 'Audit User Beta',
    email: `audit.beta.${uniqueId}@test.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  // 1. Test Unauthenticated Protected Route Access
  console.log('Test 1: Protected route access without auth...');
  const unauthRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET'
  });
  auditResults.routeProtection = (unauthRes.statusCode === 401);
  console.log(`Protected API /api/auth/me returned: ${unauthRes.statusCode} (Expected 401)`);

  // 2. Test Invalid Login
  console.log('Test 2: Invalid login credentials...');
  const invalidLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'nonexistent@test.com', password: 'WrongPassword!' });
  auditResults.invalidLogin = (invalidLoginRes.statusCode === 401);
  console.log(`Invalid login returned: ${invalidLoginRes.statusCode} (Expected 401)`);

  // 3. Test Registration User A
  console.log('Test 3: Registration for User A...');
  const regRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, testUserA);
  
  auditResults.registration = (regRes.statusCode === 200 && regRes.data.success);
  const tokenA = regRes.data.token;
  const cookieA = regRes.cookies ? regRes.cookies[0].split(';')[0] : '';
  console.log(`Registration status: ${regRes.statusCode}, Token received: ${!!tokenA}`);

  // 4. Verify Account in Database
  console.log('Test 4: Verify User A in Database...');
  const dbUserA = await prisma.user.findUnique({
    where: { email: testUserA.email }
  });
  auditResults.dbUserSaved = (dbUserA !== null && dbUserA.name === testUserA.name);
  console.log(`DB User found: ${!!dbUserA}, Name: ${dbUserA?.name}`);

  // 5. Test Login User A
  console.log('Test 5: Login with User A...');
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: testUserA.email, password: testUserA.password });
  auditResults.login = (loginRes.statusCode === 200 && loginRes.data.success);
  console.log(`Login status: ${loginRes.statusCode}`);

  // 6. Test Project Creation for User A
  console.log('Test 6: Create Project for User A...');
  const projectRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/projects',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    name: 'Hackathon jQuery Project',
    description: 'Migration project for IBM Hackathon Evaluation',
    sourceLanguage: 'jQuery / JavaScript',
    targetLanguage: 'React + TypeScript'
  });
  auditResults.projectCreation = (projectRes.statusCode === 200 && projectRes.data.success);
  const projectId = projectRes.data?.project?.id;
  console.log(`Project created: ${projectRes.statusCode}, Project ID: ${projectId}`);

  // 7. Verify Project in Database & Listing
  console.log('Test 7: Verify Project in DB & Listing...');
  const listProjectsRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/projects',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const projectFound = listProjectsRes.data?.projects?.some(p => p.id === projectId);
  auditResults.projectPersistence = projectFound;
  console.log(`Project listed in user projects: ${projectFound}`);

  // 8. Test Conversion with User-Supplied jQuery Code
  console.log('Test 8: AI Code Conversion with User Code...');
  const userTestCode = `$(document).ready(function () {
    $("#loadUser").click(function () {
        $.ajax({
            url: "/api/user",
            success: function (user) {
                $("#username").text(user.name);
                $("#email").text(user.email);
            },
            error: function () {
                $("#error").text("Unable to load user");
            }
        });
    });
});`;

  const convertRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/conversions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, {
    projectId: projectId,
    legacyCode: userTestCode,
    sourceLanguage: 'jQuery / JavaScript',
    targetLanguage: 'React + TypeScript',
    strategy: 'Production Ready',
    aiMode: 'Balanced'
  });

  auditResults.conversionExecution = (convertRes.statusCode === 200 && convertRes.data.success);
  const conversionData = convertRes.data?.conversion;
  const conversionId = conversionData?.id;
  auditResults.modernCodeGenerated = !!(conversionData?.modernCode && conversionData.modernCode.includes('React'));
  auditResults.insightsGenerated = !!(conversionData?.insights && conversionData.insights.length > 0);
  console.log(`Conversion status: ${convertRes.statusCode}, Conversion ID: ${conversionId}`);
  console.log(`Modern Code Generated: ${auditResults.modernCodeGenerated}`);
  console.log(`Insights count: ${conversionData?.insights?.length || 0}`);

  // 9. Verify Conversion Saved in DB
  console.log('Test 9: Verify Conversion in Database...');
  const dbConversion = await prisma.conversion.findUnique({
    where: { id: conversionId },
    include: { testCases: true }
  });
  auditResults.conversionPersistence = !!dbConversion;
  auditResults.testsGenerated = (dbConversion?.testCases?.length > 0);
  console.log(`DB Conversion saved: ${!!dbConversion}, Generated test cases: ${dbConversion?.testCases?.length || 0}`);

  // 10. Test Individual Test Case Execution
  console.log('Test 10: Test Execution...');
  const firstTest = dbConversion?.testCases?.[0];
  let testExecutionSuccess = false;
  if (firstTest) {
    const runTestRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/tests/${firstTest.id}/run`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    testExecutionSuccess = (runTestRes.statusCode === 200 && runTestRes.data.testCase.status === 'PASS');
    console.log(`Individual test run status: ${runTestRes.data?.testCase?.status} (${runTestRes.data?.testCase?.duration})`);
  }
  auditResults.testExecution = testExecutionSuccess;

  // 11. Test Batch Run All Tests
  console.log('Test 11: Batch Run All Tests...');
  const runAllRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/tests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, { conversionId });
  auditResults.runAllTests = (runAllRes.statusCode === 200 && runAllRes.data.success);
  console.log(`Batch test execution: ${runAllRes.data?.message}`);

  // 12. Test Diff API Endpoint
  console.log('Test 12: Diff API Endpoint...');
  const diffRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/diff/${conversionId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  auditResults.diff = (diffRes.statusCode === 200 && diffRes.data.diff.legacyCode === userTestCode);
  console.log(`Diff endpoint status: ${diffRes.statusCode}, Legacy code matches: ${diffRes.data?.diff?.legacyCode === userTestCode}`);

  // 13. Test History API Endpoint
  console.log('Test 13: History API Endpoint...');
  const historyRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/history',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  const inHistory = historyRes.data?.history?.some(h => h.id === conversionId);
  auditResults.history = (historyRes.statusCode === 200 && inHistory);
  console.log(`Conversion present in history: ${inHistory}`);

  // 14. Test Theme Preferences Retrieval & Persistence
  console.log('Test 14: Theme Preferences API & DB Persistence...');
  const prefPutRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/preferences',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  }, { theme: 'light' });

  const prefGetRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/preferences',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  auditResults.themePersistence = (prefGetRes.statusCode === 200 && prefGetRes.data.theme === 'light');
  console.log(`Theme updated to: ${prefGetRes.data?.theme}`);

  // 15. Test Security & Data Isolation (User A vs User B)
  console.log('Test 15: Data Isolation Check between User A and User B...');
  const regResB = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, testUserB);
  const tokenB = regResB.data.token;

  // User B tries to view User A's project
  const userBTryProject = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/projects/${projectId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });

  // User B tries to view User A's conversion
  const userBTryConversion = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/conversions/${conversionId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });

  // User B lists projects - should NOT see User A's project
  const userBProjects = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/projects',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  const leakedProject = userBProjects.data?.projects?.some(p => p.id === projectId);

  const isIsolated = (
    (userBTryProject.statusCode === 404 || userBTryProject.statusCode === 401) &&
    (userBTryConversion.statusCode === 404 || userBTryConversion.statusCode === 401) &&
    !leakedProject
  );
  auditResults.securityIsolation = isIsolated;
  console.log(`Security data isolation verified: ${isIsolated}`);

  // Clean up test audit users
  await prisma.user.deleteMany({
    where: {
      email: { in: [testUserA.email, testUserB.email] }
    }
  });

  console.log('\n--- FINAL AUDIT SUMMARY ---');
  console.log(JSON.stringify(auditResults, null, 2));
}

runAudit().catch(e => {
  console.error('Audit script error:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
