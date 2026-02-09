"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

interface EditModeContextType {
  isEditMode: boolean
  setEditMode: (value: boolean) => void
  toggleEditMode: () => void
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined)

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth()
  const [isEditMode, setEditModeState] = useState(false)

  const setEditMode = useCallback(
    (value: boolean) => {
      if (isAdmin) setEditModeState(value)
    },
    [isAdmin]
  )

  const toggleEditMode = useCallback(() => {
    if (isAdmin) setEditModeState((prev) => !prev)
  }, [isAdmin])

  return (
    <EditModeContext.Provider
      value={{
        isEditMode: isAdmin ? isEditMode : false,
        setEditMode,
        toggleEditMode,
      }}
    >
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const ctx = useContext(EditModeContext)
  if (ctx === undefined) {
    throw new Error("useEditMode must be used within EditModeProvider")
  }
  return ctx
}
