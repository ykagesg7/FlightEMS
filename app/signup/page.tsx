// app/signup/page.tsx
import SignUpFormComponent from '../../components/SignUpForm';
import Layout from '../../components/layout/layout';
import Header from '../../components/layout/header'
import Footer from '../../components/layout/footer'

export default function SignUpForm() {

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              新規アカウント登録
            </h2>
          </div>
          <SignUpFormComponent />
        </div>
      </div>
    </div>
  );
}