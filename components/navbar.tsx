"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  User,
  LogOut,
  Map,
  List,
  AlertCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/issues", label: "Browse Issues", icon: List },
  { href: "/issues/map", label: "View Map", icon: Map },
  { href: "/report", label: "Report an Issue", icon: AlertCircle, primary: true },
];

export default function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleSignIn = () => router.push("/auth/login");
  const handleSignUp = () => router.push("/auth/sign-up");

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.06)]">
      <div className="container mx-auto px-6 md:px-32 flex h-16 items-center justify-between gap-6">

        {/* ── LEFT: Logo ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            {/* ── Mobile Sheet ───────────────────────────────── */}
            <SheetContent side="left" className="p-0 w-[300px] flex flex-col">
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setSheetOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">CR</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-base tracking-tight">
                    City Report
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-gray-700"
                  onClick={() => setSheetOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Sheet nav links */}
              <nav className="flex-1 flex flex-col px-3 py-4 gap-1 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Navigation
                </p>
                {navLinks.map(({ href, label, icon: Icon, primary }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSheetOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${primary
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${primary ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="flex-1">{label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                  </Link>
                ))}
              </nav>

              {/* Sheet footer — user info or login/signup */}
              <div className="border-t border-gray-100 px-4 py-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-blue-100 text-blue-700 text-sm font-semibold shrink-0">
                      {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-500"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      onClick={() => { setSheetOpen(false); handleSignUp(); }}
                    >
                      Sign Up
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50"
                      onClick={() => { setSheetOpen(false); handleSignIn(); }}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo mark — always show title including on mobile */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">CR</span>
            </div>
            <span className="font-semibold text-gray-900 text-base tracking-tight">
              City Report
            </span>
          </Link>
        </div>

        {/* ── CENTER: Desktop nav ─────────────────────────── */}
        <nav className="hidden md:flex items-center gap-2 mx-auto">
          <Link
            href="/issues"
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Browse Issues
          </Link>
          <Link
            href="/issues/map"
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            View Map
          </Link>
          <Link
            href="/report"
            className="ml-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            Report an Issue
          </Link>
        </nav>

        {/* ── RIGHT: User / Auth ──────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Avatar className="h-8 w-8">
                    {user.picture && <AvatarImage src={user.picture} alt={user.name} />}
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-lg border border-gray-100">
                <DropdownMenuLabel className="px-2 py-2">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400 font-normal mt-0.5">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-700 cursor-pointer"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-blue-500 cursor-pointer hover:bg-blue-500"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900 px-4"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 shadow-sm"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}