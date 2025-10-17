
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../hooks/useData';
import UserCard from '../components/UserCard';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchPage: React.FC = () => {
    const query = useQuery();
    const searchTerm = query.get('q') || '';
    const { users } = useData();

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return users; // Show all users if search is empty
        
        return users.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10">
                <h1 className="text-xl font-bold p-4 border-b border-brand-border">Search</h1>
                {searchTerm && <p className="px-4 pb-2 text-gray-300">Showing results for "{searchTerm}"</p>}
            </div>
            <div>
                {searchResults.length > 0 ? (
                    searchResults.map(user => <UserCard key={user.id} user={user} />)
                ) : (
                    <p className="p-4 text-center text-gray-400">No users found.</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;