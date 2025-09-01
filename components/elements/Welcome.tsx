import React from "react";
import SplitText from "./SplitText";
import Image from "next/image";
import ShinyText from "./ShinyText";

const Welcome = () => {
  return (
    <div className="text-center flex flex-col animate-fade-in lg:mt-4">
      <div className="w-full flex items-center justify-center mb-2">
        <Image
          src="/JasimImg.png"
          alt="Mo-Jasim"
          width={800}
          height={800}
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>

      <SplitText
        text="Welcome to Generative AI"
        className="text-[35px] max-sm:text-[22px] font-[600] tracking-wide"
        delay={50}
        animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
        animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
        easing={(t) => 1 - Math.pow(1 - t, 3)}
        threshold={0.1}
        rootMargin="-100px"
      />

      <ShinyText
        text="Now you can search the web with AI, Let's have a try now?"
        disabled={false}
        speed={3}
        className="custom-class text-[16px] font-medium"
      />
    </div>
  );
};

export default Welcome;
