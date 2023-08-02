import { createContext } from 'react'

import { DEFAULT_PRIMARY_COLOR, DEFAULT_TEXT_COLOR } from '../constants'

type ColorsContextType = {
  primaryColor: string
  primaryColorTransparent: string
  primaryColorDark: string
  textColor: string
}

export default createContext<ColorsContextType>({
  primaryColor: DEFAULT_PRIMARY_COLOR,
  primaryColorTransparent: DEFAULT_PRIMARY_COLOR,
  primaryColorDark: DEFAULT_PRIMARY_COLOR,
  textColor: DEFAULT_TEXT_COLOR,
})
