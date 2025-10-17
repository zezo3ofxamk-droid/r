import React, { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';
import UserCard from '../components/UserCard';
import { SearchIcon } from '../components/Icons';

const AdminPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { users } = useData();

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return users;
        
        return users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10 p-4 border-b border-brand-border">
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <div className="relative mt-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for users..."
                        className="w-full bg-brand-purple-mid text-white rounded-full py-2 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                </div>
            </div>
            <div>
                {searchResults.length > 0 ? (
                    searchResults.map(user => <UserCard key={user.id} user={user} adminMode={true} />)
                ) : (
                    <p className="p-4 text-center text-gray-400">No users found.</p>
                )}
            </div>
        </div>
    );
};

export default AdminPage;