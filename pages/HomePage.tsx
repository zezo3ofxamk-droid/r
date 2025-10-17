
import React, { useMemo } from 'react';
import CreateRt from '../components/CreateZeet';
import Rt from '../components/Zeet';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { Rt as RtType } from '../types';

const HomePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { rts } = useData();

    const feedRts = useMemo(() => {
        if (!currentUser) return [];

        // Show all rts from all users, sorted chronologically
        return rts
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    }, [currentUser, rts]);

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10">
                <h1 className="text-xl font-bold p-4 border-b border-brand-border">Home</h1>
            </div>
            <div className="hidden sm:block">
                <CreateRt />
            </div>
            <div>
                {feedRts.map((rt: RtType) => (
                    <Rt key={rt.id} rt={rt} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
