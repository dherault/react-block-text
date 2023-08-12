import Checkbox from './Checkbox'

function Icon() {
  return (
    <div className="rbt-w-full rbt-h-full rbt-flex rbt-items-center rbt-justify-center rbt-gap-1">
      <div className="rbt-scale-[85%]">
        <Checkbox
          checked
          onCheck={() => {}}
        />
      </div>
      <div className="rbt-grow rbt-flex rbt-flex-col rbt-gap-[0.2rem] -rbt-mr-1">
        <div className="rbt-border-b rbt-border-gray-300" />
        <div className="rbt-w-[50%] rbt-border-b rbt-border-gray-300" />
        <div className="rbt-w-[75%] rbt-border-b rbt-border-gray-300" />
      </div>
    </div>
  )
}

export default Icon
