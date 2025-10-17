
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RIcon } from '../components/Icons';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { login, signup, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("Image file is too large. Please select a file smaller than 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'login') {
            const user = login(username.trim(), password);
            if (user) {
                navigate('/');
            } else {
                setError('Invalid username or password.');
            }
        } else { // signup mode
            if (!username.trim() || !password || !displayName.trim()) {
                setError('Username, password, and display name are required.');
                return;
            }
            const user = signup({
                username: username.trim(),
                password: password,
                displayName: displayName.trim(),
                avatar: avatar || `https://picsum.photos/seed/${username.trim()}/200`,
                bio: bio.trim() || `Welcome to my R profile!`
            });
            if (user) {
                navigate('/');
            } else {
                setError('Username is already taken.');
            }
        }
    };
    
    const commonInputClass = "appearance-none rounded-md relative block w-full px-3 py-3 border border-brand-border bg-brand-purple-dark text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md w-full p-8 space-y-8 bg-brand-purple-mid/90 backdrop-blur-sm rounded-2xl border border-brand-border">
                <div className="flex justify-center">
                   <RIcon className="w-14 h-14" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
                </h2>
                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={commonInputClass} placeholder="Username" />
                        <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={commonInputClass} placeholder="Password" />
                        
                        {mode === 'signup' && (
                            <>
                                <input id="displayName" name="displayName" type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={commonInputClass} placeholder="Display Name" />
                                <textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} className={commonInputClass + " resize-none"} placeholder="Bio (optional)" rows={3}></textarea>
                                <div>
                                    <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-300 mb-2">Profile Picture (optional)</label>
                                    <input id="avatar-upload" name="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"/>
                                    {avatar && <img src={avatar} alt="Avatar preview" className="w-24 h-24 rounded-full mt-4 mx-auto" />}
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-purple-mid focus:ring-blue-500">
                           {mode === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }} className="font-medium text-blue-400 hover:text-blue-300">
                        {mode === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;