
import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';
import { VerifiedBadgeIcon } from '../components/Icons';

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        const formatted = (num / 1000000).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'M' : formatted + 'M';
    }
    if (num >= 1000) {
        const formatted = (num / 1000).toFixed(1);
        return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'K' : formatted + 'K';
    }
    return num.toString();
};

const VerificationPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { follows, manualVerifications, generatedFollowers } = useData();

    const followerCount = useMemo(() => {
        if (!currentUser) return 0;
        const realFollowerCount = follows.filter(f => f.followingId === currentUser.id).length;
        const fakeFollowerCount = generatedFollowers[currentUser.id] || 0;
        return realFollowerCount + fakeFollowerCount;
    }, [currentUser, follows, generatedFollowers]);

    const verificationGoal = 1000;
    const progressPercentage = Math.min((followerCount / verificationGoal) * 100, 100);

    const isManuallyVerified = useMemo(() => {
        return currentUser ? manualVerifications.includes(currentUser.id) : false;
    }, [manualVerifications, currentUser]);

    const isVerified = followerCount >= verificationGoal || isManuallyVerified;

    return (
        <div>
            <div className="sticky top-0 bg-brand-purple-dark/70 backdrop-blur-md z-10">
                <h1 className="text-xl font-bold p-4 border-b border-brand-border">Verification Conditions</h1>
            </div>
            <div className="p-6">
                <div className="bg-brand-purple-mid p-6 rounded-2xl border border-brand-border">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-2xl font-bold">Get Verified</h2>
                        <VerifiedBadgeIcon />
                    </div>
                    <p className="text-gray-300 mt-2">
                        To get the verified badge, you need to have at least {formatNumber(verificationGoal)} followers. Once you reach this milestone, the badge will automatically appear next to your name across the platform. Users may also be verified manually by the R team.
                    </p>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold">Your Progress Toward Automatic Verification</h3>
                        <div className="flex justify-between items-center mt-2 text-gray-300">
                            <span>{formatNumber(followerCount)} Followers</span>
                            <span className="text-gray-400">{formatNumber(verificationGoal)} Goal</span>
                        </div>
                        <div className="w-full bg-brand-border rounded-full h-2.5 mt-2">
                            <div 
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        {isVerified && (
                             <p className="text-green-400 font-bold mt-4 text-center">
                                Congratulations! You are verified.
                                {isManuallyVerified && followerCount < verificationGoal && (
                                    <span className="block text-sm text-blue-400 font-normal mt-1">
                                        You were manually verified by the R team.
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
