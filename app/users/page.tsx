"use client";

import { UserProfile } from "@clerk/nextjs";

export default function Users() {

  return (
    <div>
      Users
      <UserProfile /> 
    </div>
  )
}