"use client"
import React, { createContext, useContext, useId } from "react"

type DropzoneOptions = {
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
}

interface FileUploaderProps {
  value?: File[] | null
  onValueChange?: (files: File[] | null) => void
  children?: React.ReactNode
  className?: string
  dropzoneOptions?: DropzoneOptions
  inputId?: string
}

const FileUploadContext = createContext<{ inputId?: string } | undefined>(undefined)

export function FileUploader({ value, onValueChange, children, className, dropzoneOptions, inputId }: FileUploaderProps) {
  const generatedId = useId()
  const id = inputId || `file-uploader-${generatedId}`

  const handleFiles = (filesList: FileList | null) => {
    if (!filesList) {
      onValueChange?.(null)
      return
    }
    let arr = Array.from(filesList)
    if (dropzoneOptions?.maxFiles && arr.length > dropzoneOptions.maxFiles) {
      arr = arr.slice(0, dropzoneOptions.maxFiles)
    }
    onValueChange?.(arr)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => e.preventDefault()

  return (
    <FileUploadContext.Provider value={{ inputId: id }}>
      <div className={className} onDrop={onDrop} onDragOver={onDragOver}>
        <input
          id={id}
          type="file"
          multiple={dropzoneOptions?.multiple ?? true}
          className="hidden"
          onChange={onChange}
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  )
}

export function FileInput({ id, className, children }: { id?: string; className?: string; children?: React.ReactNode }) {
  const ctx = useContext(FileUploadContext)
  const inputId = id || ctx?.inputId
  return (
    <label htmlFor={inputId} className={className}>
      {children}
    </label>
  )
}

export function FileUploaderContent({ children }: { children?: React.ReactNode }) {
  return <div className="mt-2">{children}</div>
}

export function FileUploaderItem({ index, children }: { index?: number; children?: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>
}

export default FileUploader
