export interface PresetSample {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  description: string;
  legacyCode: string;
  modernCode: string;
  changesCount: number;
  deprecatedCount: number;
  depsCount: number;
  confidence: number;
  insights: string[];
  testCases: Array<{
    testName: string;
    type: 'Unit' | 'Behavioral' | 'Integration' | 'Regression';
    status: 'PASS' | 'FAIL' | 'RUNNING' | 'SKIPPED';
    duration: string;
    scenario: string;
    expectedResult: string;
    actualResult: string;
    testCode: string;
  }>;
}

export const SAMPLE_PRESETS: PresetSample[] = [
  {
    id: 'jquery-user-manager',
    name: 'jQuery Counter & User List Manager',
    sourceLang: 'jQuery / JavaScript',
    targetLang: 'React + TypeScript',
    description: 'DOM manipulation, global state mutation, and jQuery AJAX callback pattern modernized to React hooks.',
    legacyCode: `// Legacy jQuery Counter & User Data Manager (circa 2012)
(function($) {
  var userCount = 0;
  var usersList = [];

  function initApp() {
    $('#btn-add-user').on('click', function(e) {
      e.preventDefault();
      var userName = $('#input-name').val();
      var userRole = $('#select-role').val();

      if (!userName || userName.trim() === '') {
        alert('Please enter a valid user name');
        return;
      }

      // Direct DOM mutation & manual counter increment
      userCount++;
      $('#total-counter').text(userCount);

      var userItem = {
        id: 'usr_' + new Date().getTime(),
        name: userName.trim(),
        role: userRole || 'Developer',
        createdAt: new Date().toLocaleDateString()
      };

      usersList.push(userItem);
      renderUserRow(userItem);

      // Reset form
      $('#input-name').val('');
      $('#status-msg').html('<span style="color: green;">User added successfully!</span>');
      setTimeout(function() {
        $('#status-msg').empty();
      }, 3000);
    });

    // Delegate delete action
    $('#user-table-body').on('click', '.btn-delete-row', function() {
      var rowId = $(this).data('id');
      $('#row-' + rowId).fadeOut(300, function() {
        $(this).remove();
        userCount--;
        $('#total-counter').text(userCount);
      });
    });

    // Legacy AJAX load
    $('#btn-sync-remote').click(function() {
      $('#loading-spinner').show();
      $.ajax({
        url: '/api/v1/legacy/users',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
          $('#loading-spinner').hide();
          if (response && response.data) {
            $.each(response.data, function(i, item) {
              usersList.push(item);
              renderUserRow(item);
            });
            userCount = usersList.length;
            $('#total-counter').text(userCount);
          }
        },
        error: function(xhr, status, error) {
          $('#loading-spinner').hide();
          alert('Failed to sync users: ' + error);
        }
      });
    });
  }

  function renderUserRow(user) {
    var html = '<tr id="row-' + user.id + '">' +
      '<td>' + user.name + '</td>' +
      '<td><span class="badge">' + user.role + '</span></td>' +
      '<td>' + user.createdAt + '</td>' +
      '<td><button class="btn-delete-row" data-id="' + user.id + '">Remove</button></td>' +
      '</tr>';
    $('#user-table-body').append(html);
  }

  $(document).ready(function() {
    initApp();
  });
})(jQuery);`,
    modernCode: `import React, { useState, useTransition, useCallback } from 'react';

export type UserRole = 'Developer' | 'Designer' | 'Product Manager' | 'Lead Architect';

export interface UserItem {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface UserManagerProps {
  initialUsers?: UserItem[];
  onSyncRemote?: () => Promise<UserItem[]>;
}

export const ModernUserManager: React.FC<UserManagerProps> = ({
  initialUsers = [],
  onSyncRemote,
}) => {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('Developer');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddUser = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setFeedbackMessage('Please enter a valid user name.');
      return;
    }

    const newUser: UserItem = {
      id: \`usr_\${Date.now()}_\${Math.random().toString(36).substring(2, 7)}\`,
      name: trimmed,
      role: roleInput,
      createdAt: new Date().toLocaleDateString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setNameInput('');
    setFeedbackMessage('User added successfully!');
    setTimeout(() => setFeedbackMessage(null), 3000);
  }, [nameInput, roleInput]);

  const handleDeleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const handleSyncRemote = useCallback(async () => {
    if (!onSyncRemote) return;
    startTransition(async () => {
      try {
        const remoteUsers = await onSyncRemote();
        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const filteredNew = remoteUsers.filter(u => !existingIds.has(u.id));
          return [...prev, ...filteredNew];
        });
        setFeedbackMessage('Successfully synchronized remote users.');
      } catch (err) {
        setFeedbackMessage(err instanceof Error ? err.message : 'Sync failed');
      }
    });
  }, [onSyncRemote]);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Management Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Active Users: <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{users.length}</span></p>
        </div>
        <button
          type="button"
          onClick={handleSyncRemote}
          disabled={isPending}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {isPending ? 'Syncing...' : 'Sync Remote'}
        </button>
      </div>

      <form onSubmit={handleAddUser} className="mt-4 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="User name"
          className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleInput}
          onChange={e => setRoleInput(e.target.value as UserRole)}
          className="px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        >
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
          <option value="Product Manager">Product Manager</option>
          <option value="Lead Architect">Lead Architect</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
        >
          Add User
        </button>
      </form>

      {feedbackMessage && (
        <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {feedbackMessage}
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Created</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 text-xs">
                  No users added yet. Fill out the form above to add an entry.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.createdAt}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};`,
    changesCount: 14,
    deprecatedCount: 5,
    depsCount: 3,
    confidence: 96,
    insights: [
      'Replaced jQuery DOM manipulation ($(...).html, .append, .fadeOut)',
      'Converted global mutable state variables to React useState hooks',
      'Extracted strict TypeScript types (UserRole, UserItem, UserManagerProps)',
      'Replaced jQuery $.ajax callback pattern with modern async/await and useTransition',
      'Eliminated imperative event listeners with declarative React JSX handlers',
      'Added zero-layout-shift responsive table styling',
    ],
    testCases: [
      {
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
    expect(screen.getByText(/Total Active Users:/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});`,
      },
      {
        testName: 'TC-02: Adds new user and updates state reactively',
        type: 'Behavioral',
        status: 'PASS',
        duration: '18ms',
        scenario: 'User enters "Sarah Connor" with role "Lead Architect" and clicks submit',
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
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});`,
      },
      {
        testName: 'TC-03: Deletion immutability and memory safety',
        type: 'Regression',
        status: 'PASS',
        duration: '9ms',
        scenario: 'Click "Remove" on an active user row',
        expectedResult: 'Row is removed from React state array immutably without DOM dangling references',
        actualResult: 'State updated via functional filter, row unmounted cleanly.',
        testCode: `import { render, screen, fireEvent } from '@testing-library/react';
import { ModernUserManager } from './ModernUserManager';

describe('Deletion verification', () => {
  it('removes item immutably', () => {
    const initial = [{ id: '1', name: 'John Doe', role: 'Developer' as const, createdAt: '2026-09-27' }];
    render(<ModernUserManager initialUsers={initial} />);
    fireEvent.click(screen.getByText('Remove'));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});`,
      },
      {
        testName: 'TC-04: Async sync remote data resilience',
        type: 'Integration',
        status: 'PASS',
        duration: '24ms',
        scenario: 'Trigger remote synchronization mock call with network delay',
        expectedResult: 'Disables button, handles loading state, merges without duplicate IDs',
        actualResult: 'Remote items seamlessly incorporated and state deduplicated.',
        testCode: `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModernUserManager } from './ModernUserManager';

describe('Async Sync', () => {
  it('merges remote users deduplicated', async () => {
    const mockSync = jest.fn().mockResolvedValue([
      { id: '2', name: 'Alice Smith', role: 'Designer', createdAt: '2026-09-27' }
    ]);
    render(<ModernUserManager onSyncRemote={mockSync} />);
    fireEvent.click(screen.getByText('Sync Remote'));
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
  });
});`,
      },
    ],
  },
  {
    id: 'legacy-xhr-data-fetcher',
    name: 'Legacy XMLHttpRequest Callback Handler',
    sourceLang: 'Legacy JavaScript (ES5)',
    targetLang: 'TypeScript + Fetch API',
    description: 'Converts old XMLHttpRequest with nested callback hell and loose error handling into modern async/await with custom generics.',
    legacyCode: `// Legacy ES5 XMLHttpRequest with Callback Hell
function fetchProjectAnalytics(projectId, token, onSuccess, onError) {
  if (!projectId) {
    if (onError) onError(new Error("Project ID is required"));
    return;
  }

  var xhr = new XMLHttpRequest();
  var endpoint = "/api/v1/projects/" + encodeURIComponent(projectId) + "/metrics";
  
  xhr.open("GET", endpoint, true);
  xhr.setRequestHeader("Accept", "application/json");
  if (token) {
    xhr.setRequestHeader("Authorization", "Bearer " + token);
  }

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var parsedData = JSON.parse(xhr.responseText);
          // Nested legacy computation
          if (parsedData.status === "success") {
            if (onSuccess) onSuccess(parsedData.payload);
          } else {
            if (onError) onError(new Error(parsedData.message || "Unknown error"));
          }
        } catch (e) {
          if (onError) onError(new Error("JSON parsing failed"));
        }
      } else {
        if (onError) onError(new Error("HTTP error " + xhr.status));
      }
    }
  };

  xhr.onerror = function() {
    if (onError) onError(new Error("Network connection failure"));
  };

  xhr.send();
}`,
    modernCode: `/**
 * Modern Type-safe Fetch Client for Project Analytics
 */

export interface ProjectMetrics {
  projectId: string;
  totalConversions: number;
  testPassRate: number;
  averageExecutionMs: number;
  modernizationScore: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  payload: T;
  message?: string;
}

export class AnalyticsApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly rawError?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsApiError';
  }
}

export async function fetchProjectAnalytics(
  projectId: string,
  token?: string,
  signal?: AbortSignal
): Promise<ProjectMetrics> {
  if (!projectId || projectId.trim() === '') {
    throw new AnalyticsApiError('Project ID is required and cannot be empty');
  }

  const endpoint = \`/api/v1/projects/\${encodeURIComponent(projectId.trim())}/metrics\`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': \`Bearer \${token}\` } : {}),
      },
      signal,
    });

    if (!response.ok) {
      throw new AnalyticsApiError(
        \`Request failed with HTTP status \${response.status}: \${response.statusText}\`,
        response.status
      );
    }

    const data: ApiResponse<ProjectMetrics> = await response.json();

    if (data.status !== 'success' || !data.payload) {
      throw new AnalyticsApiError(data.message || 'Server returned unsuccessful status');
    }

    return data.payload;
  } catch (error) {
    if (error instanceof AnalyticsApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AnalyticsApiError('Request was aborted by caller');
    }
    throw new AnalyticsApiError(
      error instanceof Error ? error.message : 'Unknown network failure',
      undefined,
      error
    );
  }
}`,
    changesCount: 11,
    deprecatedCount: 3,
    depsCount: 0,
    confidence: 98,
    insights: [
      'Replaced deprecated XMLHttpRequest with modern Fetch API',
      'Converted callback parameters into strongly-typed Promise return value',
      'Added structured custom exception class AnalyticsApiError',
      'Implemented AbortSignal support for request cancellation',
      'Added strict TypeScript generics for API response payload',
    ],
    testCases: [
      {
        testName: 'TC-01: Throws error on empty project ID',
        type: 'Unit',
        status: 'PASS',
        duration: '4ms',
        scenario: 'Calling fetchProjectAnalytics with empty string',
        expectedResult: 'Rejects immediately with AnalyticsApiError without making HTTP call',
        actualResult: 'Caught AnalyticsApiError: Project ID is required.',
        testCode: `import { fetchProjectAnalytics, AnalyticsApiError } from './analytics';

describe('Validation', () => {
  it('throws on empty ID', async () => {
    await expect(fetchProjectAnalytics('')).rejects.toThrow(AnalyticsApiError);
  });
});`,
      },
      {
        testName: 'TC-02: Successfully parses JSON payload',
        type: 'Integration',
        status: 'PASS',
        duration: '15ms',
        scenario: 'Mock fetch returns 200 with valid metrics payload',
        expectedResult: 'Resolves with strongly-typed ProjectMetrics object',
        actualResult: 'Returned metrics object matching schema.',
        testCode: `import { fetchProjectAnalytics } from './analytics';

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    status: 'success',
    payload: { projectId: 'p1', totalConversions: 42, testPassRate: 98.5, averageExecutionMs: 120, modernizationScore: 95 }
  })
});

describe('Success resolution', () => {
  it('resolves valid payload', async () => {
    const res = await fetchProjectAnalytics('p1', 'tok_123');
    expect(res.totalConversions).toBe(42);
  });
});`,
      },
    ],
  },
];
