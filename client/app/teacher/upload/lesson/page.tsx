"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { ArrowLeft, Upload, BookOpen, GraduationCap, FileText, CloudUpload, Paperclip } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem
} from "@/components/ui/file-upload"
import { Textarea } from "@/components/ui/textarea"

// Form validation schema with proper field names mapped to form names
const formSchema = z.object({
  name_8639001806: z.string().min(1, "Module name is required"),
  name_8036503275: z.string().min(1, "Indicative content is required"),
  name_9455943014: z.string().min(1, "Please select a level"),
  name_0185902985: z.any().optional(), // File upload field
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LessonUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload configuration
  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 10, // 10MB
    multiple: true,
    accept: {
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_8639001806: "",
      name_8036503275: "",
      name_9455943014: "",
      description: ""
    }
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      // TODO: Implement actual lesson upload logic
      console.log("Form values:", values);
      console.log("Uploaded files:", files);

      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      toast.success("Lesson uploaded successfully!");
      router.push("/teacher/lessons"); // Redirect to lessons list
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to upload lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen ">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/teacher/lessons" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">Back to Lessons</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Lesson</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your lesson content and materials to share with your students.
            Make sure to include all necessary resources and clear descriptions.
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-slate-900">Lesson Details</CardTitle>
                <CardDescription className="text-slate-600">
                  Fill in the information below to create your lesson
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Module Name */}
                <FormField
                  control={form.control}
                  name="name_8639001806"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Module Name</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the module name (e.g., Introduction to React)"
                          className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-600">
                        Choose a clear, descriptive name for your lesson module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Indicative Content */}
                  <FormField
                    control={form.control}
                    name="name_8036503275"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900">
                          Indicative Content
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the key topics and learning objectives..."
                            className="min-h-[120px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-slate-600">
                          Outline the main content and learning outcomes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Level Selection */}
                  <FormField
                    control={form.control}
                    name="name_9455943014"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-slate-900">
                          Academic Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select the appropriate level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="level 3" className="text-base py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Level 3 - Foundation</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="level 4" className="text-base py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Level 4 - Intermediate</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="level 5" className="text-base py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span>Level 5 - Advanced</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-slate-600">
                          Choose the complexity level for this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="name_0185902985"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                        <CloudUpload className="h-4 w-4" />
                        <span>Upload Lesson Materials</span>
                      </FormLabel>
                      <FormControl>
                        <FileUploader
                          value={files}
                          onValueChange={setFiles}
                          dropzoneOptions={dropZoneConfig}
                          className="relative bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors"
                        >
                          <FileInput
                            id="fileInput"
                            className="outline-none"
                          >
                            <div className="flex items-center justify-center flex-col p-12 w-full">
                              <CloudUpload className='text-slate-400 w-12 h-12 mb-4' />
                              <p className="mb-2 text-base text-slate-600 text-center">
                                <span className="font-semibold text-blue-600">Click to upload</span>
                                <span className="text-slate-500"> or drag and drop</span>
                              </p>
                              <p className="text-sm text-slate-500 text-center">
                                PPT, PPTX, PDF, DOC, DOCX files up to 10MB
                              </p>
                            </div>
                          </FileInput>
                          <FileUploaderContent className="mt-4">
                            {files &&
                              files.length > 0 &&
                              files.map((file, i) => (
                                <FileUploaderItem
                                  key={i}
                                  index={i}
                                  className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center space-x-3"
                                >
                                  <Paperclip className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
                                  <span className="text-xs text-slate-500 flex-shrink-0">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </span>
                                </FileUploaderItem>
                              ))}
                          </FileUploaderContent>
                        </FileUploader>
                      </FormControl>
                      <FormDescription className="text-slate-600">
                        Upload your presentation slides, documents, or other lesson materials
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-slate-900">
                        Additional Notes (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional instructions, prerequisites, or notes for students..."
                          className="min-h-[100px] border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-600">
                        Include any extra information that might be helpful for students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-6 border-t border-slate-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Lesson...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5" />
                        <span>Create Lesson</span>
                      </div>
                    )}
                  </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}