const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Seeding Legacy → Modern database...');

  // Create demo user
  const passwordHash = await bcrypt.hash('DemoPass123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@legacymodern.dev' },
    update: {},
    create: {
      name: 'Demo Architect',
      email: 'demo@legacymodern.dev',
      passwordHash,
      preferences: {
        create: {
          theme: 'dark',
        },
      },
      projects: {
        create: {
          name: 'Enterprise Modernization Workspace',
          description: 'Core repository containing legacy jQuery and ES5 module conversions',
          sourceLanguage: 'jQuery / JavaScript',
          targetLanguage: 'React + TypeScript',
        },
      },
    },
    include: {
      projects: true,
    },
  });

  const project = user.projects[0];

  // Seed sample conversion
  const legacySample = `// Legacy jQuery Counter & User Manager
(function($) {
  var userCount = 0;
  var usersList = [];

  function initApp() {
    $('#btn-add-user').on('click', function(e) {
      e.preventDefault();
      var userName = $('#input-name').val();
      if (!userName || userName.trim() === '') {
        alert('Please enter a valid user name');
        return;
      }
      userCount++;
      $('#total-counter').text(userCount);
      var userItem = {
        id: 'usr_' + new Date().getTime(),
        name: userName.trim(),
        role: $('#select-role').val() || 'Developer',
        createdAt: new Date().toLocaleDateString()
      };
      usersList.push(userItem);
      renderUserRow(userItem);
      $('#input-name').val('');
    });
  }

  function renderUserRow(user) {
    $('#user-table-body').append('<tr id="row-' + user.id + '"><td>' + user.name + '</td></tr>');
  }

  $(document).ready(function() {
    initApp();
  });
})(jQuery);`;

  const modernSample = `import React, { useState, useCallback } from 'react';

export type UserRole = 'Developer' | 'Designer' | 'Product Manager';

export interface UserItem {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export const ModernUserManager: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('Developer');

  const handleAddUser = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    const newUser: UserItem = {
      id: \`usr_\${Date.now()}\`,
      name: trimmed,
      role: roleInput,
      createdAt: new Date().toLocaleDateString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setNameInput('');
  }, [nameInput, roleInput]);

  return (
    <div className="p-6 rounded-lg bg-slate-900 border border-slate-800">
      <h2 className="text-lg font-semibold text-slate-100">Active Users: {users.length}</h2>
      <form onSubmit={handleAddUser} className="mt-4 flex gap-3">
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="User name"
          className="px-3 py-2 bg-slate-800 rounded border border-slate-700 text-slate-100 text-sm"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium">
          Add User
        </button>
      </form>
    </div>
  );
};`;

  const conversion = await prisma.conversion.create({
    data: {
      projectId: project.id,
      userId: user.id,
      sourceLanguage: 'jQuery / JavaScript',
      targetLanguage: 'React + TypeScript',
      legacyCode: legacySample,
      modernCode: modernSample,
      strategy: 'Production Ready',
      aiMode: 'Balanced',
      status: 'COMPLETED',
      confidence: 96,
      changesCount: 14,
      deprecatedCount: 5,
      depsCount: 3,
      insightsJson: JSON.stringify([
        'Replaced jQuery DOM manipulation with React state & JSX',
        'Converted mutable global variables into React useState hook',
        'Extracted strict TypeScript types (UserRole, UserItem)',
        'Added type-safe event handlers',
      ]),
    },
  });

  // Seed sample tests
  await prisma.testCase.createMany({
    data: [
      {
        conversionId: conversion.id,
        testName: 'TC-01: Renders user count and empty state',
        type: 'Unit',
        status: 'PASS',
        duration: '12ms',
        scenario: 'Initialize component with default empty users list',
        expectedResult: 'Display total active users as 0 and display empty table message',
        actualResult: 'Rendered Total Active Users: 0 and table empty state row correctly.',
        testCode: `import { render, screen } from '@testing-library/react';
import { ModernUserManager } from './ModernUserManager';

describe('ModernUserManager', () => {
  it('renders initial user count as zero', () => {
    render(<ModernUserManager />);
    expect(screen.getByText(/Active Users:/i)).toBeInTheDocument();
  });
});`,
      },
      {
        conversionId: conversion.id,
        testName: 'TC-02: Adds new user and updates state reactively',
        type: 'Behavioral',
        status: 'PASS',
        duration: '18ms',
        scenario: 'User enters "Sarah Connor" with role "Developer" and clicks submit',
        expectedResult: 'User list prepends new item and counter updates to 1 without reload',
        actualResult: 'New row rendered with role badge, input cleared, count incremented.',
        testCode: `import { render, screen, fireEvent } from '@testing-library/react';
import { ModernUserManager } from './ModernUserManager';

describe('User Creation Flow', () => {
  it('adds user on form submit', () => {
    render(<ModernUserManager />);
    const input = screen.getByPlaceholderText('User name');
    fireEvent.change(input, { target: { value: 'Sarah Connor' } });
    fireEvent.click(screen.getByText('Add User'));
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
  });
});`,
      },
    ],
  });

  console.log('[SEED] Database seed completed successfully!');
  console.log('[SEED] Demo User Email: demo@legacymodern.dev');
  console.log('[SEED] Demo User Password: DemoPass123!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
