import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseEnabled, PHOTO_BUCKET } from '../lib/supabase'
import { resizeImageForUpload } from '../lib/resizeImage'

export interface StoredPhoto {
  id: string
  storagePath: string
  displayOrder: number
  url: string
}

function publicUrl(path: string): string {
  return supabase!.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

/** Photos for one property (keyed by the stable string id, e.g. "industrial-42"). */
export function usePropertyPhotos(propertyId: string) {
  const [photos, setPhotos] = useState<StoredPhoto[]>([])
  const [loading, setLoading] = useState(supabaseEnabled)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPhotos = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('property_photos')
      .select('*')
      .eq('property_id', propertyId)
      .order('display_order', { ascending: true })
    if (!error && data) {
      setPhotos(
        data.map((r) => ({
          id: r.id as string,
          storagePath: r.storage_path as string,
          displayOrder: r.display_order as number,
          url: publicUrl(r.storage_path as string),
        })),
      )
    }
    setLoading(false)
  }, [propertyId])

  useEffect(() => {
    setPhotos([])
    fetchPhotos()
  }, [fetchPhotos])

  const upload = useCallback(
    async (files: File[]) => {
      if (!supabase || files.length === 0) return
      setUploading(true)
      setError(null)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const userId = session?.user?.id ?? null
      let order = photos.length ? Math.max(...photos.map((p) => p.displayOrder)) + 1 : 0
      const added: StoredPhoto[] = []

      for (const raw of files) {
        try {
          const file = await resizeImageForUpload(raw)
          const path = `${propertyId}/${crypto.randomUUID()}.jpg`
          const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, {
            contentType: 'image/jpeg',
            upsert: false,
          })
          if (up.error) throw up.error
          const { data, error } = await supabase
            .from('property_photos')
            .insert({
              property_id: propertyId,
              storage_path: path,
              display_order: order++,
              created_by: userId,
            })
            .select()
            .single()
          if (error) throw error
          added.push({
            id: data.id as string,
            storagePath: path,
            displayOrder: data.display_order as number,
            url: publicUrl(path),
          })
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Upload failed')
        }
      }
      setPhotos((prev) => [...prev, ...added])
      setUploading(false)
    },
    [propertyId, photos],
  )

  const remove = useCallback(
    async (photoId: string) => {
      if (!supabase) return
      const photo = photos.find((p) => p.id === photoId)
      if (!photo) return
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      await supabase.storage.from(PHOTO_BUCKET).remove([photo.storagePath])
      await supabase.from('property_photos').delete().eq('id', photoId)
    },
    [photos],
  )

  return { photos, loading, uploading, error, upload, remove }
}
