'use client'

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const defaultFields = [
  { name: "Email", key: "email", enabled: true, predefined: true },
  { name: "Password", key: "password", enabled: true, predefined: true },
  { name: "Full Name", key: "name", enabled: false, predefined: false },
  { name: "Phone Number", key: "phone", enabled: false, predefined: false },
]

const RegisterConfigFormFortenant = ({ projId, projService }) => {
  const router = useRouter()
  const [fields, setFields] = useState(defaultFields)
  const [customField, setCustomField] = useState("")

  const toggleField = (key) => {
    setFields((prev) =>
      prev.map((f) =>
        f.key === key ? { ...f, enabled: !f.enabled } : f
      )
    )
  }

  const addCustomField = () => {
    const trimmed = customField.trim().toLowerCase()
    if (!trimmed) return

    // Prevent duplicate keys
    const exists = fields.some((f) => f.key.toLowerCase() === trimmed)
    if (exists) {
      // alert("This field already exists.")
      toast.warning("This field already exists.")
      return
    }

    setFields((prev) => [
      ...prev,
      {
        name: customField.trim(),
        key: trimmed,
        enabled: true,
        predefined: false,
      },
    ])
    setCustomField("")
  }

  const handleSave = async () => {
    const selected = fields.filter((f) => f.enabled)

    try {
      const resp = await axios.post(
        `/api/platform/project/subservice/registerschema/${projId}`,
        {
          schema: { fields: selected },
          serviceName: projService,
          subServiceName: "Registeration",
        }
      )

      if (resp?.data?.success) {
        toast.success("Service Created Successfully.")
        router.push(
          `/home/project/${projId}/service/${projService}/sub-service/${resp?.data?.projectServiceId}`
        )
      }
    } catch (err) {
      console.error(err)
      // alert("Failed to save configuration.")
      toast.error("Failed to save configuration.")
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Select fields for your registration form</h3>
      
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <Label>{field.name}</Label>
            <Switch
              disabled={field.predefined} // ✅ Fixed disable condition
              checked={field.enabled}
              onCheckedChange={() => toggleField(field.key)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Input
          placeholder="Add custom field..."
          value={customField}
          onChange={(e) => setCustomField(e.target.value)}
        />
        <Button onClick={addCustomField}>Add</Button>
      </div>

      <Button className="w-full mt-6 font-medium cursor-pointer select-none" onClick={handleSave}>
        Save & Continue
      </Button>
    </div>
  )
}

export default RegisterConfigFormFortenant
