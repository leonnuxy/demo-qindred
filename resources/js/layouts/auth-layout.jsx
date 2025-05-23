import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
export default function AuthLayout({ children, title, description, logoText = 'Qindred', ...props }) {
    return (<AuthLayoutTemplate title={title} description={description} logoText={logoText} {...props}>
            {children}
        </AuthLayoutTemplate>);
}
