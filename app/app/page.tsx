import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/ui/Footer";
export default function LandingPage() {
  return (
    <>
    <div className="container lg:flex-row items-center justify-center gap-6 pb-48 ml-5 pt-6 lg:h-[calc(100vh-4rem)]">
      <div className="upper-text flex items-center justify-center lg:py-0 lg:order-2 py-10 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tighter text-center max-w-[920px] md:text-5xl">
          Join the Farmers Revolution powered by Chainlink
        </h1>                   
      </div>
      <div className="flex flex-col lg:flex-row lg:justify-center w-full py-6">
        {/* Image */}
        <div className="image-container relative rounded-lg overflow-hidden w-full lg:w-1/2">
          <Image
            src="/images/farmers.png"
            alt="Farmers"
            priority={false}
            width={1800}
            height={900}
            className="object-cover w-full h-full"
          />
          <div className="lower-details absolute bottom-0 right-0 bg-white bg-opacity-80 p-4 rounded-tl-lg">
            {/* Lower details content goes here */}
            <p className="text-sm text-gray-600">Additional information</p>
          </div>
        </div>
        
        {/* Text */}
        <div className="text-container flex flex-col justify-center py-4 px-6 lg:w-1/2 lg:items-end lg:text-right">
          <h2 className="text-3xl font-bold tracking-tight text-right text-muted-foreground lg:text-4xl">
            Dapp for connecting farmers with the investors by creating RWAs tokenization of crops and farm products to attract investments
          </h2>
          <div className="flex flex-row gap-4 mt-6 justify-center lg:justify-end">
            
          </div>
          
        </div>
    
      </div>
      <div className="flex flex-row gap-4 mt-6 justify-center lg:justify-start w-full">
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
    </div>
    {/* <Footer/> */}
    </>
  );
}
