import { cn } from "@/lib/utils"


const Page = () => {

  const something=true;

  return (
    <div className={cn(
      "text-red-300 font-bold",
      something == true && "text-green-500"
      )}>
 Hello World
    </div>
  )
};

export default Page;