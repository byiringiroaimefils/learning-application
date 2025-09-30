'use client'

import { useState, use } from "react"
import { ChevronDown, ChevronRight, Check, ArrowLeft, Eye, Clock, Users, Star, Award, Target, BookOpen, Trophy, Zap, Menu, X, Lock, CheckCircle } from "lucide-react"
import { AppSidebar } from "@/components/teacher/app-sidebar"
import { SiteHeader } from "@/components/teacher/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { coursesData, Course, CourseItem, CourseSection, updateCourseProgress, setActiveLesson, getNextLesson, getPreviousLesson, updateLessonLocks, canAccessLesson, isExamUnlocked } from "@/data/courses"

export default function CourseLearningPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const course: Course | undefined = coursesData.find((c: Course) => c.id === params.id)
    const [sections, setSections] = useState<CourseSection[]>(course?.sections || [])
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(342) // 6:42 in seconds
    const [duration] = useState(1080) // 18:00 in seconds
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)
    const [showExam, setShowExam] = useState(false)
    const [examAnswers, setExamAnswers] = useState<Record<string, number>>({})
    const [examSubmitted, setExamSubmitted] = useState(false)
    const [examScore, setExamScore] = useState<number | null>(null)

    const currentItem: CourseItem | null = sections
        .flatMap(section => section.items)
        .find(item => item.isActive) || null

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
                <div className="text-center">
                    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-red-600">Course not found</h1>
                    <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                        <Link href="/courses">Back to Courses</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // Calculate progress and statistics from actual data including exam
    const totalLessons = sections.flatMap(section => section.items).length || 0
    const completedLessons = sections.flatMap(section => section.items).filter(item => item.completed).length || 0
    const examCompleted = course?.finalExam?.completed ? 1 : 0
    const totalItems = totalLessons + (course?.finalExam ? 1 : 0)
    const completedItems = completedLessons + examCompleted
    const courseProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // Get current lesson position
    const allItems = sections.flatMap(section => section.items)
    const currentItemIndex = allItems.findIndex(item => item.isActive)
    const currentLessonNumber = currentItemIndex >= 0 ? currentItemIndex + 1 : 1

    // Navigation helpers
    const previousItem = currentItemIndex > 0 ? allItems[currentItemIndex - 1] : null
    const nextItem = currentItemIndex < allItems.length - 1 ? allItems[currentItemIndex + 1] : null

    // Check if next lesson is accessible
    const canGoToNext = nextItem ? canAccessLesson(course?.id || '', nextItem.id) : false
    const examUnlocked = course ? isExamUnlocked(course.id) : false

    const toggleSection = (sectionId: string) => {
        setSections(
            sections.map(section =>
                section.id === sectionId
                    ? { ...section, isOpen: !section.isOpen }
                    : section
            )
        )
    }

    const toggleCompletion = (itemId: string) => {
        const item = sections.flatMap(s => s.items).find(i => i.id === itemId)
        if (item && course) {
            const newCompleted = !item.completed
            updateCourseProgress(course.id, itemId, newCompleted)

            // Update lesson locks after completion change
            updateLessonLocks(course.id)

            // Update local state
            setSections(
                sections.map(section => ({
                    ...section,
                    items: section.items.map(item =>
                        item.id === itemId
                            ? { ...item, completed: newCompleted }
                            : item
                    ),
                }))
            )

            // Auto-navigate to next lesson if completed and unlocked
            if (newCompleted) {
                const nextLesson = getNextLesson(course.id, itemId)
                if (nextLesson && canAccessLesson(course.id, nextLesson.id)) {
                    setTimeout(() => {
                        navigateToItem(nextLesson)
                    }, 1000) // Small delay for better UX
                }
            }
        }
    }

    const setActiveItem = (itemId: string) => {
        if (course) {
            // Check if lesson is accessible before setting as active
            if (!canAccessLesson(course.id, itemId)) {
                return // Don't allow access to locked lessons
            }

            setActiveLesson(course.id, itemId)

            // Update local state
            setSections(
                sections.map(section => ({
                    ...section,
                    items: section.items.map(item => ({
                        ...item,
                        isActive: item.id === itemId,
                    })),
                }))
            )
            // Close mobile sidebar when selecting an item
            setShowMobileSidebar(false)
            // Hide exam if switching to a lesson
            setShowExam(false)
        }
    }

    const navigateToItem = (item: CourseItem) => {
        setActiveItem(item.id)
    }

    const goToNextLesson = () => {
        if (course && currentItem) {
            const nextLesson = getNextLesson(course.id, currentItem.id)
            if (nextLesson && canAccessLesson(course.id, nextLesson.id)) {
                navigateToItem(nextLesson)
            }
        }
    }

    const goToPreviousLesson = () => {
        if (course && currentItem) {
            const prevLesson = getPreviousLesson(course.id, currentItem.id)
            if (prevLesson) {
                navigateToItem(prevLesson)
            }
        }
    }

    const startExam = () => {
        if (course && isExamUnlocked(course.id)) {
            setShowExam(true)
            setExamAnswers({})
            setExamSubmitted(false)
            setExamScore(null)
        }
    }

    const submitExam = () => {
        if (!course?.finalExam) return

        let correctAnswers = 0
        course.finalExam.questions.forEach(question => {
            if (examAnswers[question.id] === question.correctAnswer) {
                correctAnswers++
            }
        })

        const score = Math.round((correctAnswers / course.finalExam.questions.length) * 100)
        setExamScore(score)
        setExamSubmitted(true)

        // Mark exam as completed if passed
        if (score >= course.finalExam.passingScore) {
            course.finalExam.completed = true
        }
    }

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setExamAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }))
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }





    return (
        <SidebarProvider
            style={{
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
        >
            {/* Desktop Sidebar */}
            <AppSidebar variant="inset" className="hidden lg:flex" />

            <SidebarInset>
                <SiteHeader />

                <div className="flex h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Enhanced Header Bar */}
                        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 dark:text-white px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                                    <Button variant="ghost" asChild className="text-gray-600 dark:text-white p-1 sm:p-2">
                                        <Link href={`/courses/${course.id}/overview`} className="flex items-center">
                                            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                                            <span className="hidden sm:inline">Course Overview</span>
                                            <span className="sm:hidden">Back</span>
                                        </Link>
                                    </Button>
                                    <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
                                    <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm dark:text-white min-w-0">
                                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{course.title}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="text-xs sm:text-sm whitespace-nowrap">
                                            <span className="sm:hidden">{currentLessonNumber}/{totalLessons}</span>
                                            <span className="hidden sm:inline">Lesson {currentLessonNumber} of {totalLessons}</span>
                                        </span>
                                    </div>
                                </div>
                                {/* Mobile Menu Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="lg:hidden p-2"
                                    onClick={() => setShowMobileSidebar(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Video Player Area */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Left - Main Video Content */}
                            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                                <div className="max-w-5xl mx-auto space-y-4 sm:space-y-8">
                                    {/* Enhanced Video Header */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                                    <Badge className="bg-blue-100 text-blue-800 px-2 py-1 text-xs">
                                                        {course.level}
                                                    </Badge>
                                                    <Badge className="bg-green-100 text-green-800 px-2 py-1 text-xs">
                                                        Software Development
                                                    </Badge>
                                                </div>
                                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
                                                    {currentItem?.title || `${course.title} - Getting Started`}
                                                </h1>
                                                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                                        <span className="font-medium">{Math.floor(Math.random() * 100000) + 10000} views</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                                                        <span className="font-medium">4.{Math.floor(Math.random() * 3) + 7} rating</span>
                                                    </div>
                                                    {course.instructor && (
                                                        <div className="flex items-center space-x-1 sm:space-x-2">
                                                            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                                                            <span className="font-medium truncate max-w-[100px] sm:max-w-none">{course.instructor}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Navigation */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto flex border-gray-300 items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 hover:bg-blue-50 hover:border-blue-200 text-sm"
                                            onClick={goToPreviousLesson}
                                            disabled={!course || !currentItem || !getPreviousLesson(course.id, currentItem.id)}
                                        >
                                            <ArrowLeft size={14} /> Previous Lesson
                                        </Button>
                                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                            <Button
                                                className="w-full sm:w-auto flex items-center gap-2 bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                                                onClick={() => currentItem && toggleCompletion(currentItem.id)}
                                            >
                                                {currentItem?.completed ? (
                                                    <>
                                                        <Check size={14} className="text-green-300" />
                                                        Mark Incomplete
                                                    </>
                                                ) : (
                                                    <>
                                                        Mark Complete
                                                        <Check size={14} />
                                                    </>
                                                )}
                                            </Button>
                                            {nextItem ? (
                                                <Button
                                                    className={cn(
                                                        "w-full sm:w-auto flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm",
                                                        canGoToNext
                                                            ? "bg-green-500 text-white hover:bg-green-600"
                                                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                                    )}
                                                    onClick={goToNextLesson}
                                                    disabled={!canGoToNext}
                                                >
                                                    {canGoToNext ? (
                                                        <>Next Lesson <ChevronRight size={14} /></>
                                                    ) : (
                                                        <>
                                                            <Lock size={14} />
                                                            Complete Current Lesson
                                                        </>
                                                    )}
                                                </Button>
                                            ) : examUnlocked ? (
                                                <Button
                                                    className="w-full sm:w-auto flex items-center gap-2 bg-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                                                    onClick={startExam}
                                                >
                                                    <Trophy size={14} />
                                                    Take Final Exam
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full sm:w-auto flex items-center gap-2 bg-gray-400 text-gray-200 px-4 sm:px-6 py-2 sm:py-3 shadow-lg cursor-not-allowed text-sm"
                                                    disabled
                                                >
                                                    <Lock size={14} />
                                                    Complete All Lessons
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Right Sidebar */}
                            <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-700 overflow-y-auto shadow-lg">
                                <div className="p-6 space-y-6">
                                    {/* Course Playlist/Navigation */}
                                    <Card className="shadow-lg border-gray-300">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-lg font-bold flex items-center">
                                                <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                                                Course Content
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                                            {sections.map((section, sectionIndex) => (
                                                <div key={section.id} className="space-y-2">
                                                    <button
                                                        onClick={() => toggleSection(section.id)}
                                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-6 h-6 bg-pink-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                                                                {sectionIndex + 1}
                                                            </div>
                                                            <span className="font-medium text-sm text-left">{section.title}</span>
                                                        </div>
                                                        {section.isOpen ? (
                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </button>

                                                    {section.isOpen && (
                                                        <div className="ml-4 space-y-1">
                                                            {section.items.map((item, itemIndex) => {
                                                                const isLocked = course ? !canAccessLesson(course.id, item.id) : false;
                                                                return (
                                                                    <button
                                                                        key={item.id}
                                                                        onClick={() => setActiveItem(item.id)}
                                                                        disabled={isLocked}
                                                                        className={cn(
                                                                            "w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200",
                                                                            item.isActive
                                                                                ? "bg-blue-50 border border-blue-200 dark:bg-blue-950/20"
                                                                                : isLocked
                                                                                    ? "opacity-50 cursor-not-allowed"
                                                                                    : "hover:bg-gray-50 dark:hover:bg-gray-700",
                                                                            item.completed && "bg-green-50 dark:bg-green-950/20"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                                                            item.completed
                                                                                ? "bg-green-500 text-white"
                                                                                : item.isActive
                                                                                    ? "bg-blue-500 text-white"
                                                                                    : isLocked
                                                                                        ? "bg-gray-300 text-gray-500"
                                                                                        : "bg-gray-200 text-gray-600"
                                                                        )}>
                                                                            {item.completed ? (
                                                                                <Check className="h-3 w-3" />
                                                                            ) : isLocked ? (
                                                                                <Lock className="h-3 w-3" />
                                                                            ) : (
                                                                                itemIndex + 1
                                                                            )}
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-sm",
                                                                            item.isActive && "font-medium text-blue-700 dark:text-blue-300",
                                                                            item.completed && "text-green-700 dark:text-green-300",
                                                                            isLocked && "text-gray-400"
                                                                        )}>
                                                                            {item.title}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-lg border-gray-300 ">
                                        <Link href=''>
                                            <Button className="mt-5 ml-5 bg-blue-400">Continue with Lesson</Button>
                                        </Link>
                                        <Link href=''>
                                            <Button className="mt-5 ml-5 bg-blue-400">Continue with Lesson</Button>
                                        </Link>
                                    </Card>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {showMobileSidebar && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/50"
                                onClick={() => setShowMobileSidebar(false)}
                            />

                            {/* Sidebar */}
                            <div className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Course Content</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMobileSidebar(false)}
                                        className="p-2"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Mobile Course Content */}
                                    <Card className="shadow-lg border-gray-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base font-bold flex items-center">
                                                <BookOpen className="h-4 w-4 mr-2 text-purple-600" />
                                                Lessons
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {sections.map((section, sectionIndex) => (
                                                <div key={section.id} className="space-y-2">
                                                    <button
                                                        onClick={() => toggleSection(section.id)}
                                                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-5 h-5 bg-pink-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                                                                {sectionIndex + 1}
                                                            </div>
                                                            <span className="font-medium text-sm text-left">{section.title}</span>
                                                        </div>
                                                        {section.isOpen ? (
                                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4 text-gray-500" />
                                                        )}
                                                    </button>

                                                    {section.isOpen && (
                                                        <div className="ml-3 space-y-1">
                                                            {section.items.map((item, itemIndex) => {
                                                                const isLocked = course ? !canAccessLesson(course.id, item.id) : false;
                                                                return (
                                                                    <button
                                                                        key={item.id}
                                                                        onClick={() => setActiveItem(item.id)}
                                                                        disabled={isLocked}
                                                                        className={cn(
                                                                            "w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-all duration-200",
                                                                            item.isActive
                                                                                ? "bg-blue-50 border border-blue-200 dark:bg-blue-950/20"
                                                                                : isLocked
                                                                                    ? "opacity-50 cursor-not-allowed"
                                                                                    : "hover:bg-gray-50 dark:hover:bg-gray-700",
                                                                            item.completed && "bg-green-50 dark:bg-green-950/20"
                                                                        )}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                                                                            item.completed
                                                                                ? "bg-green-500 text-white"
                                                                                : item.isActive
                                                                                    ? "bg-blue-500 text-white"
                                                                                    : isLocked
                                                                                        ? "bg-gray-300 text-gray-500"
                                                                                        : "bg-gray-200 text-gray-600"
                                                                        )}>
                                                                            {item.completed ? (
                                                                                <Check className="h-2 w-2" />
                                                                            ) : isLocked ? (
                                                                                <Lock className="h-2 w-2" />
                                                                            ) : (
                                                                                itemIndex + 1
                                                                            )}
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-sm truncate",
                                                                            item.isActive && "font-medium text-blue-700 dark:text-blue-300",
                                                                            item.completed && "text-green-700 dark:text-green-300",
                                                                            isLocked && "text-gray-400"
                                                                        )}>
                                                                            {item.title}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider >
    )
}