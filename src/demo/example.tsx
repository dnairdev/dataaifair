import React, { useState, useEffect } from 'react';

// Example component to demonstrate learning features
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
}

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
  isLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelect, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Handle user selection
  const handleUserClick = (user: User) => {
    onUserSelect(user);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  // Render empty state
  if (filteredUsers.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">
          {searchTerm ? 'No users found matching your search.' : 'No users available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* User list */}
      <div className="space-y-2">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                user.role === 'admin' 
                  ? 'bg-red-100 text-red-800' 
                  : user.role === 'moderator'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
