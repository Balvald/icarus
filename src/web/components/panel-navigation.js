
import { useState, useEffect, Fragment } from 'react'

import { useRouter } from 'next/router'

export default function PanelNavigation ({ items = [], search = () => {} }) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [searchInputVisible, setSearchInputVisible] = useState(false)

  useEffect(() => {
    document.addEventListener('click', onClickHandler)
    return () => document.removeEventListener('click', onClickHandler)
    function onClickHandler (event) {
      if (!event?.target?.id.startsWith('secondary-navigation__search-')) {
        setSearchInputVisible(false)
      }
    }
  }, [])

  return (
    <div className='secondary-navigation'>
      {items.map(item =>
        <Fragment key={item.icon}>
          {(item.type && item?.type === 'SEARCH') &&
            <>
              <button
                id='secondary-navigation__search-toggle'
                tabIndex='2'
                disabled={search === false}
                className={`button--icon ${searchInputVisible ? 'button--selected button--secondary' : ''}`}
                onClick={() => {
                  setSearchInputVisible(!searchInputVisible)
                }}
              >{searchInputVisible}
                <i className={`icon icarus-terminal-${item.icon}`} />
              </button>
              {searchInputVisible &&
                <form
                  id='secondary-navigation__search-form'
                  autoComplete='off'
                  onSubmit={(event) => {
                    event.preventDefault()
                    const el = document.getElementById('secondary-navigation__search-input')
                    search(el.value)
                    setSearchInputVisible(false)
                    setSearchValue() // Reset input contents after submission
                  }}
                >
                  <input
                    id='secondary-navigation__search-input'
                    autoFocus
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    tabIndex='2'
                    type='text'
                    className='input--secondary'
                    placeholder='System name…'
                  />
                  <button
                    id='secondary-navigation__search-button'
                    type='submit' className='button--active button--secondary'
                    style={{ float: 'left', display: 'inline-block', xfontSize: '1.5rem', height: '4rem', width: '8rem' }}
                    tabIndex='2'
                  >Search
                  </button>
                </form>}
            </>}

          {!item.type &&
            <button
              tabIndex='2'
              className={`button--icon ${item.active ? 'button--active' : ''}`}
              onClick={
                item.onClick
                  ? item.onClick
                  : () => item.url ? router.push(item.url) : () => null
              }
            >
              <i className={`icon icarus-terminal-${item.icon}`} />
            </button>}
        </Fragment>
      )}
    </div>
  )
}
