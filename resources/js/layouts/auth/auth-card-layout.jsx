import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import '@css/auth-shared.css';
export default function AuthCardLayout({ children, title, description, logoText = 'Qindred' }) {
    return (<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="qindred-logo self-center">
                    <div className="flex items-center justify-center">
                        <AppLogoIcon variant="auth" className="qindred-logo-icon fill-current text-black dark:text-white"/>
                    </div>
                    <span className="qindred-logo-text">
                        {logoText}
                    </span>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl">
                        <CardHeader className="px-10 pt-8 pb-0 text-center">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>);
}
