const handleTryOnUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || !image) return

  setTryOnImage(file)
  setTryOnLoading(true)

  try {
    const response = await fetch(image)
    const blob = await response.blob()
    const modelImage = new File([blob], 'model.jpg', { type: 'image/jpeg' })

    const formData = new FormData()
    formData.append('clothes_image', file)
    formData.append('custom_model', modelImage)
    formData.append('clothes_type', 'upper_body')

    const tryOnResponse = await fetch('/api/virtual-tryon', {
      method: 'POST',
      body: formData,
    })

    if (!tryOnResponse.ok) {
      throw new Error('Failed to process virtual try-on')
    }

    const data = await tryOnResponse.json()
    if (data.error) {
      throw new Error(data.error)
    }
    
    if (data.result?.output_image_url?.[0]) {
      setTryOnResult(data.result.output_image_url[0])
    } else {
      throw new Error('No result image received')
    }
  } catch (error) {
    console.error('Virtual try-on failed:', error)
    // You might want to show an error message to the user here
  } finally {
    setTryOnLoading(false)
  }
}
