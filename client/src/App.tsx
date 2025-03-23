import { ThemeProvider } from "./components/theme-provider"
import { ThemeToggle } from "./components/theme-toggle"
import Home from "./pages/home"
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="walmart-receipt-theme">
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <span className="font-bold">Walmart Receipt Maker</span>
              </a>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {/* Add search or other controls here if needed */}
              </div>
              <nav className="flex items-center space-x-2">
                <ThemeToggle />
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Home />
        </main>
        <footer className="border-t py-6 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with ❤️ by{" "}
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Your Name
              </a>
            </div>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
