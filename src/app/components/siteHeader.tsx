'use client'

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function MentorshipDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-full justify-start">
          <GraduationCap className="mr-2 h-4 w-4" />
          <span>Mentorship</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/mentorship">Mentorship Home</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/mentors">Find Mentors</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/mentor-matching">Smart Mentor Matching</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/become-mentor">Become a Mentor</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/become-mentee">Request Mentorship</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/my-mentors">My Mentors</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/mentorship/mentees">My Mentees</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 