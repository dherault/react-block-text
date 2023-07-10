import type { IconProps } from '../types'

function Icon({ children }: IconProps) {
  return (
    <>
      <div className="font-serif text-gray-600">
        {children}
      </div>
      <div className="w-full flex flex-col gap-1">
        <div className="border-b border-gray-300" />
        <div className="w-[75%] border-b border-gray-300" />
        <div className="w-[50%] border-b border-gray-300" />
      </div>
    </>
  )
}

export default Icon
