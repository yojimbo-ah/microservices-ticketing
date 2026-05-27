import Link from 'next/link';

export const Header = ({ currentUser }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
            <Link href="/" className="navbar-brand fw-bold">
                Ticket.com
            </Link>
            <div className="ms-auto d-flex gap-3">
                {currentUser ? (
                    <Link href="/auth/signout" className="btn btn-outline-light btn-sm">
                        Sign Out
                    </Link>
                ) : (
                    <>
                        <Link href="/auth/signup" className="btn btn-outline-light btn-sm">
                            Sign Up
                        </Link>
                        <Link href="/auth/signin" className="btn btn-light btn-sm">
                            Sign In
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};