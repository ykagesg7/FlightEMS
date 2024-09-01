// app/page.tsx

'use client'

import React, { useEffect, useState} from 'react'
import Link from 'next/link'
import { Book, MapPin, BarChart2, Users, Star } from 'lucide-react'
import Layout from '../components/layout/layout'
import Header from '../components/layout/header'
import LoginHeader from '../components/layout/login-header'
import Footer from '../components/layout/footer'
import '../app/globals.css'
import { supabase } from '../lib/supabaseClient'

// コンポーネントの型定義
interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

interface TestimonialCardProps {
  name: string;
  role: string;
  content: string;
}

// 再利用可能なコンポーネント
const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => (
  <button className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out ${className}`} {...props}>
    {children}
  </button>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="feature-card bg-white p-6 rounded-lg shadow-md">
    {icon}
    <h3 className="feature-card__title text-xl font-semibold mt-4 mb-2">{title}</h3>
    <p className="feature-card__description text-gray-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, content }) => (
  <div className="testimonial-card bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
    <Star className="testimonial-card__icon text-yellow-400 mb-4" size={32} />
    <p className="testimonial-card__content text-gray-600 mb-4">{content}</p>
    <h4 className="testimonial-card__name font-semibold text-gray-900">{name}</h4>
    <p className="testimonial-card__role text-sm text-gray-500">{role}</p>
  </div>
);

// メインのHomeコンポーネント
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkUser()
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <div className='sticky top-0 z-50 w-full'>
        {isLoggedIn ? <LoginHeader /> : <Header />}
      </div>

      <Layout>
        <main className="flex-grow pt-16">
          {/* Hero section */}
          <div className='flex flex-col md:flex-row justify-center'>            
            <HeroSection
              image="/f16.png"
              title="Excellence in Flight"
              gradient="to-r"
            />
            <HeroSection
              image="/f2.png"
              title="TECHで最高の学びを"
              subtitle="ともに学び、成長するためのパイロットのコミュニティー"
              gradient="to-l"
            />
          </div>

          {/* 特徴セクション */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-12 text-center">Feature</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard icon={<Book />} title="LMS（学習管理システム）" description="個人最適化された学習で、理論を効率的に習得" />
                <FeatureCard icon={<MapPin />} title="飛行計画システム" description="ＧＩＳ（地理情報システム）を活用した、効率的な飛行計画" />
                <FeatureCard icon={<BarChart2 />} title="ダッシュボード" description="個人パフォーマンスをリアルタイムで分析" />
                <FeatureCard icon={<Users />} title="コミュニティ" description="パイロット間の交流" />
              </div>
            </div>
          </section>

          {/* LMSセクション */}
          <section className="py-20">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold mb-6">LMS</h2>
                <p className="mb-6 text-gray-600">
                  最新の学習理論を取り入れた学習管理で、あなたの学習体験を変革します。<br/>
                  あなたの回答データを分析してダッシュボードに表示するとともに、いつ、何を学習すべきなのかを学習理論に基づいて最適なタイミングで提案します。
                </p>
                <Button>機能を体験する</Button>         
              </div>
            </div>
          </section>

          {/* 飛行計画システムセクション */}
          <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row-reverse items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                <h2 className="text-3xl font-bold mb-6">飛行計画システム</h2>
                <p className="mb-6 text-gray-600">
                  ＧＩＳを駆使し、直感的な操作で飛行計画の作成をサポートします。<br/>
                  気象データ、ウェイポイント、飛行場情報などを統合し、最適な計画を効率的に立案できます。
                </p>
                <Button>機能を体験する</Button>
              </div>
            </div>
          </section>

          {/* CTAセクション */}
          <section className="py-20 bg-blue-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">さあ、ともに夢への第一歩を踏み出そう</h2>
              <Link href="/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700">
                  登録する
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </Layout>
      <Footer className="footer" />
    </div>
  )
}

// ヒーローセクションコンポーネント
const HeroSection: React.FC<{
  image: string;
  title: string;
  subtitle?: string;
  gradient: string;
}> = ({ image, title, subtitle, gradient }) => (
  <section className="w-full md:w-1/2 h-[50vh] md:h-screen bg-cover bg-center relative overflow-hidden group">
    <div 
      className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-in-out group-hover:scale-110"
      style={{ backgroundImage: `url('${image}')` }}
    ></div>
    <div className={`absolute inset-0 bg-gradient-${gradient} from-black via-black/90 to-transparent opacity-80`}></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl mt-4 max-w-2xl mx-auto text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </section>
);