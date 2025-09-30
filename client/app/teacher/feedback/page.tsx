"use client"
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationCard from "@/components/notification/NotificationCard";
import NotificationFilter from "@/components/notification/NotificationFilter";
import NotificationSkeleton from "@/components/notification/NotificationSkeleton";
import { AppSidebar } from "@/components/teacher/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/teacher/site-header";
import AIChatIcon from "@/components/ai/page";
import { Bell, Check } from "lucide-react";


type Notification = {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: "message" | "deadline" | "achievement";
    isRead: boolean;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<"all" | "unread" | Notification["type"]>("all");
    const [isLoading, setIsLoading] = useState(true);

    // Simulate data fetch
    useEffect(() => {
        setTimeout(() => {
            setNotifications([
                {
                    id: "1",
                    title: "Assignment Graded",
                    message: "Your 'Advanced React' submission scored 95%!",
                    timestamp: "2 hours ago",
                    type: "achievement",
                    isRead: false,
                },
                {
                    id: "2",
                    title: "New Message",
                    message: "Instructor commented on your discussion post",
                    timestamp: "1 day ago",
                    type: "message",
                    isRead: true,
                },
            ]);
            setIsLoading(false);
        }, 1000);
    }, []);


    const filteredNotifications = notifications.filter((n) => {
        if (filter === "all") return true;
        if (filter === "unread") return !n.isRead;
        return n.type === filter;
    });
    const dismissNotification = (id: string) => {
        setNotifications(notifications.filter((n) => n.id !== id));
    };

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-[#141414] text-gray-900 dark:text-gray-100">
                 <AIChatIcon />
                    <div>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-between items-center mb-8"
                        >
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                               Feedback
                            </h1>
                
                        </motion.div>

                        {/* Filter */}
                        <NotificationFilter onFilterChange={setFilter} />

                        {/* Notifications List */}
                        <div className="space-y-3">
                            {isLoading ? (
                                <>
                                    <NotificationSkeleton />
                                    <NotificationSkeleton />
                                    <NotificationSkeleton />
                                </>
                            ) : (
                                <AnimatePresence>
                                    {filteredNotifications.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="glass-card rounded-xl p-8 text-center"
                                        >
                                            <p>No feedback found</p>
                                        </motion.div>
                                    ) : (
                                        filteredNotifications.map((notification) => (
                                            <NotificationCard
                                                key={notification.id}
                                                {...notification}
                                                onDismiss={dismissNotification}
                                            />
                                        ))
                                    )}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}