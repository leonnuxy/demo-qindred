import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import AppLogo from '@/components/app-logo';

export default function Welcome() {
    const { auth } = usePage().props;
    return (<>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net"/>
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet"/>
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link 
                                href={route('dashboard')} 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[--qindred-green-600] text-white shadow hover:bg-[--qindred-green-700] dark:bg-[--qindred-green-700] dark:hover:bg-[--qindred-green-800] h-9 px-4 py-2"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link 
                                    href={route('login')} 
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-muted text-muted-foreground hover:bg-muted/90 h-9 px-4 py-2"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    href={route('register')} 
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#39c94b] text-white shadow hover:bg-[#6ac075] dark:bg-[#85d68f] dark:hover:bg-[#6ac075] h-9 px-4 py-2"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex flex-col items-center justify-center flex-grow">
                    <div className="text-center mb-8">
                        <div className="flex flex-col items-center mb-6">
                            <AppLogoIcon variant="auth" className="w-24 h-24 mb-4" />
                            <h1 className="text-4xl font-semibold mb-2">Welcome to Qindred</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400"> Discover Your roots, Build Your tree</p>
                        </div>
                    </div>
                </div>
            </div>
        </>);
}
