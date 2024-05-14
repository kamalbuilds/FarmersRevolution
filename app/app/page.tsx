import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 lg:h-[calc(100vh-4rem)]">
      {/* Text with buttons */}
      <section className="flex flex-col items-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center max-w-[920px] md:text-5xl">
          Join the Farmers Revolution powered by Chainlink
        </h1>
        <h2 className="text-2xl font-normal tracking-tight text-center text-muted-foreground mt-4">
           Dapp for connecting farmers with the investors by creating RWAs tokenization of crops and farm products to attract investments

        </h2>
        <div className="flex flex-row gap-4 mt-6">
          <Link href="/farm">
            <Button variant="default" size="lg">
              Tokenize
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="secondary" size="lg">
              Invest
            </Button>
          </Link>
        </div>
      </section>
      {/* Image */}
      <section className="flex flex-col items-center max-w-[680px]">
        <Image
          src="/images/farmers.png"
          alt="Farmers"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full"
        />
      </section>
    </div>
  );
}
