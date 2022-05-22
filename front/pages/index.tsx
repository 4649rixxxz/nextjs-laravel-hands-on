import type { NextPage } from 'next';
import { AxiosError, AxiosResponse } from 'axios';
import { useState, ChangeEvent } from 'react';
import { RequiredMark } from '../components/RequiredMark';
import { axiosApi } from '../lib/axios';
import { useRouter } from 'next/router';
import { useUserState } from '../atoms/userAtom';

type LoginForm = {
  email: string;
  password: string;
}

type Validation = {
  email?: string;
  password?: string;
  loginFailed?: string;
};

const Home: NextPage = () => {
  const router = useRouter();
  // POSTデータのstate
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  })
  // バリデーションメッセージののstate
  const [validation, setValidation] = useState<Validation>({});

  const updateLoginForm = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginForm({...loginForm, [e.target.name]: e.target.value});
  }

  const { setUser } = useUserState();

  // ログイン
  const login = () => {
    // バリデーションメッセージの初期化
    setValidation({});
    axiosApi.get('/sanctum/csrf-cookie').then((res) => {
      axiosApi.post('/login', loginForm).then((response: AxiosResponse) => {
        console.log(response.data);
        setUser(response.data.data);
        router.push('/memos');
      }).catch((err: AxiosError) => {
        const status = err.response?.status;
        if (status === 422) {
          const errors = err.response?.data.errors;
          console.log(errors)
          // state更新用のオブジェクトを別で定義
          const validationMessages: { [index: string]: string } = {} as Validation;
          Object.keys(errors).map((key: string) => {
            validationMessages[key] = errors[key][0];
          });
          // state更新用オブジェクトに更新
          setValidation(validationMessages);
          console.log(validation);
        } else if (status === 500) {
          alert('システムエラーです');
        }
      })
    })
  }

  return (
    <div className='w-2/3 mx-auto py-24'>
      <div className='w-1/2 mx-auto border-2 px-12 py-16 rounded-2xl'>
        <h3 className='mb-10 text-2xl text-center'>ログイン</h3>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>メールアドレス</p>
            <RequiredMark />
          </div>
          <input
            className='p-2 border rounded-md w-full outline-none'
            name='email'
            value={loginForm.email}
            onChange={updateLoginForm}
          />
          {validation.email && (
            <p className='py-3 text-red-500'>{validation.email}</p>
          )}
        </div>
        <div className='mb-5'>
          <div className='flex justify-start my-2'>
            <p>パスワード</p>
            <RequiredMark />
          </div>
          <small className='mb-2 text-gray-500 block'>
            8文字以上の半角英数字で入力してください
          </small>
          <input
            className='p-2 border rounded-md w-full outline-none'
            name='password'
            type='password'
            value={loginForm.password}
            onChange={updateLoginForm}
          />
          {validation.password && (
            <p className='py-3 text-red-500'>{validation.password}</p>
          )}
        </div>
        <div className='text-center mt-12'>
          {validation.loginFailed && (
            <p className='py-3 text-red-500'>{validation.loginFailed}</p>
          )}
          <button 
            className='bg-gray-700 text-gray-50 py-3 sm:px-20 px-10 rounded-xl cursor-pointer drop-shadow-md hover:bg-gray-600'
            onClick={login}
          >
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
