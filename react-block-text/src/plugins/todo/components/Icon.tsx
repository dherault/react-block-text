import Checkbox from './Checkbox'

function Icon() {
  return (
    <div className="w-full h-full flex items-center justify-center gap-1">
      <div className="scale-[85%]">
        <Checkbox
          checked
          onCheck={() => {}}
        />
      </div>
      <div className="flex-grow flex flex-col gap-[0.2rem] -mr-1">
        <div className="border-b border-gray-300" />
        <div className="w-[50%] border-b border-gray-300" />
        <div className="w-[75%] border-b border-gray-300" />
      </div>
    </div>
  )
}

export default Icon
