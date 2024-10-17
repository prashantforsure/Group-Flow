'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle,
  Users,
  Calendar,
  ChartBar,
  Zap,
  Target,
  Clock,
  BarChart,
  Briefcase,
  GraduationCap,
  Shield,
  Building,
  LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <Card className="transition-all duration-300 hover:shadow-lg">
    <CardHeader>
      <Icon className="h-10 w-10 text-purple-600 mb-2" />
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
)

interface StatCardProps {
  value: string;
  label: string;
  icon: LucideIcon;
}

const StatCard = ({ value, label, icon: Icon }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <Icon className="h-10 w-10 text-purple-600 mr-4" />
      <div>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
        <CardDescription>{label}</CardDescription>
      </div>
    </CardContent>
  </Card>
)
interface AnimatedSectionProps {
  children: ReactNode;
}
const AnimatedSection = ({ children }: AnimatedSectionProps) => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])
 

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()
  const { data: session } = useSession()
  const handleClick = () => {
    if (session) {
      router.push('/groups')
    } else {
      router.push('/auth/signin')
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
   
      <section className="relative overflow-hidden py-20 sm:py-32">
        
        <motion.div
          className="absolute top-20 left-10 w-16 h-16 bg-purple-200 rounded-full opacity-50"
          animate={{ y: scrollY * 0.2 }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-50"
          animate={{ y: scrollY * -0.1 }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-20 h-20 bg-green-200 rounded-full opacity-50"
          animate={{ y: scrollY * 0.15 }}
        />

        <div className="container mx-auto px-4">
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Streamline Team Tasks, Boost Productivity
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Empower your team with our intuitive task management platform
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
               <Button 
      size="lg" 
      className="bg-purple-600 hover:bg-purple-700"
      onClick={handleClick}
    >
      Get Started <ArrowRight className="ml-2 h-5 w-5" />
    </Button>
             
            </motion.div>
          </div>

          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="flex flex-wrap justify-around items-center gap-8">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="h-12 w-12 mx-auto text-purple-600" />
                  <p className="mt-2 font-semibold">Create Team</p>
                </motion.div>
                <ArrowRight className="h-6 w-6 text-gray-400 hidden sm:block" />
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="h-12 w-12 mx-auto text-blue-600" />
                  <p className="mt-2 font-semibold">Assign Tasks</p>
                </motion.div>
                <ArrowRight className="h-6 w-6 text-gray-400 hidden sm:block" />
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <ChartBar className="h-12 w-12 mx-auto text-green-600" />
                  <p className="mt-2 font-semibold">Track Progress</p>
                </motion.div>
                <ArrowRight className="h-6 w-6 text-gray-400 hidden sm:block" />
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <CheckCircle className="h-12 w-12 mx-auto text-red-600" />
                  <p className="mt-2 font-semibold">Complete Tasks</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={Users}
                title="Group Creation & Management"
                description="Easily create and manage teams for seamless collaboration."
              />
              <FeatureCard
                icon={Calendar}
                title="Task Assignment & Tracking"
                description="Assign tasks to team members and track progress in real-time."
              />
              <FeatureCard
                icon={ChartBar}
                title="Progress Visualization"
                description="Visualize project progress with intuitive charts and graphs."
              />
              <FeatureCard
                icon={Clock}
                title="Deadline Management"
                description="Set and monitor deadlines to ensure timely project completion."
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
              <div className="text-center md:text-left">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Create a Group</h3>
                <p className="text-gray-600">Set up your team and invite members to join.</p>
              </div>
              <div className="text-center md:text-left">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Team Members</h3>
                <p className="text-gray-600">Invite colleagues and assign roles within the group.</p>
              </div>
              <div className="text-center md:text-left">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Assign Tasks</h3>
                <p className="text-gray-600">Create and delegate tasks to team members.</p>
              </div>
              <div className="text-center md:text-left">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center mb-4 mx-auto md:mx-0">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor task completion and overall project progress.</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Use Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Briefcase className="h-10 w-10 text-purple-600 mb-2" />
                  <CardTitle>Project Teams</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Coordinate complex projects with ease, ensuring every team member stays on track.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-purple-600 mb-2" />
                  <CardTitle>Study Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Collaborate on assignments and manage study schedules for better academic performance.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Shield className="h-10 w-10 text-purple-600 mb-2" />
                  <CardTitle>Task Forces</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Organize and execute time-sensitive missions with clear task allocation and progress tracking.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <Building className="h-10 w-10 text-purple-600 mb-2" />
                  <CardTitle>Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Streamline inter-departmental projects and improve overall organizational efficiency.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </section>
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">Features Breakdown</h2>
            <Tabs defaultValue="collaboration" className="w-full">
              <TabsList className=" flex-col grid grid-cols-2 sm:grid sm:grid-cols-2 md:grid-cols-2 w-full gap-2">
                <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                <TabsTrigger value="taskManagement">Task Management</TabsTrigger>
                
              </TabsList>
              <TabsContent value="collaboration">
                <Card className="mt-4">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl sm:text-2xl">Enhanced Collaboration</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Work together seamlessly with your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm sm:text-base">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Real-time updates and notifications</li>
                      <li>Shared calendars and task lists</li>
                      <li>In-app messaging and comments</li>
                      <li>File sharing and version control</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="taskManagement">
                <Card className="mt-4">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-xl sm:text-2xl">Efficient Task Management</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Organize and prioritize work effectively</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm sm:text-base">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Drag-and-drop task boards</li>
                      <li>Custom task fields and tags</li>
                      <li>Recurring tasks and templates</li>
                      <li>Subtasks and dependencies</li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
            </Tabs>
          </AnimatedSection>
        </div>
      </section>

    
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
       
           
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><a href="https://twitter.com/prashantt_14" className="hover:text-purple-400">Twitter</a></li>
                
                <li><a href="https://www.instagram.com/prashantt_14_/" className="hover:text-purple-400">Instagram</a></li>
              </ul>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  )
}