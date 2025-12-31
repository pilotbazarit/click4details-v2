import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import UserService from '@/services/UserService'
import toast from 'react-hot-toast'

const PasswordChangeModal = ({ open, setOpen, selectedData, users, setUsers }) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // console.log("selectedData", selectedData);

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      // Replace with your actual update API call
      const response = await UserService.Commands.updateUser(selectedData.id,
        {
          password,
          password_confirmation: confirmPassword,
          _method: 'PUT'
        }
      )

      if (response.status === "success") {
        toast.success("Password updated successfully!")
        setOpen(false)
      }
    } catch (error) {
      toast.error(error?.message || "Failed to update password.")
    }
  }

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset password fields when modal closes
      setPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <hr />

        <div className="container mx-auto p-4">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 text-white">Update</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PasswordChangeModal
