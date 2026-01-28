"use server"

import { revalidatePath } from "next/cache"
import { upsertUiSpec } from "@/lib/dal/ui_specs.dal"

export async function saveUiSpecs(projectId: string, data: any) {
  try {
    const result = await upsertUiSpec(projectId, {
      design_system: data.design_system,
      components: data.components,
      wireframes_md: data.wireframes_md,
    })
    revalidatePath(`/projects/${projectId}/ui-specs`)
    return { success: true, message: "UI Specs saved successfully!" }
  } catch (error) {
    console.error("Failed to save UI Specs:", error)
    return { success: false, message: "Failed to save UI Specs" }
  }
}
