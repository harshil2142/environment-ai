import React from 'react';
import { cn } from "@/lib/utils"

const Loader = ({ loading = true , className = '' }:any) => {
  return (
    loading ? (
      <div className={cn("loader w-5 h-5 border-4 border-t-4 border-gray-400 rounded-full animate-spin",className)}></div>
    ) : null
  );
};

export default Loader;