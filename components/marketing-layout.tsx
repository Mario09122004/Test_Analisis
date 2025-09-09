import { SignInButton, SignUpButton } from '@clerk/nextjs';
import FooterSection from '@/components/footer';
import { ModeToggle } from '@/components/theme-button'

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="flex justify-end items-center p-4 gap-4 h-16">
        <ModeToggle/>
        <SignInButton />
        <SignUpButton>
          <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
            Sign Up
          </button>
        </SignUpButton>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <FooterSection />
    </>
  );
}