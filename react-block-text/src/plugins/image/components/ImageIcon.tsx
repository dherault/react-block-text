import { SVGAttributes } from 'react'

function ImageIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 30 30"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1,4v22h28V4H1z M27,24H3V6h24V24z M18,10l-5,6l-2-2l-6,8h20L18,10z M11.216,17.045l1.918,1.918l4.576-5.491L21.518,20H9 L11.216,17.045z M7,12c1.104,0,2-0.896,2-2S8.104,8,7,8s-2,0.896-2,2S5.896,12,7,12z"
      />
    </svg>
  )
}

export default ImageIcon
