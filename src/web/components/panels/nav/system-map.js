import SystemMapStar from './system-map-star'
import CopyOnClick from 'components/copy-on-click'

const factionState = {
  Expansion: {
    description: 'Controlling faction expanding influence'
  },
  Investment: {
    description: 'Ongoing investment, expansion anticipated'
  },
  War: {
    description: 'War, combat missions available'
  },
  'Civil War': {
    description: 'Civil war, combat missions available'
  },
  Elections: {
    description: 'Elections underway'
  },
  Boom: {
    description: 'Economy booming'
  },
  Bust: {
    description: 'Economy bust'
  },
  'Civil Unrest': {
    description: 'Civil Unrest, reduced security, bounty missions'
  },
  Famine: {
    description: 'Famine, high demand for food'
  },
  Outbreak: {
    description: 'Outbreak, high demand for medicines'
  },
  Lockdown: {
    description: 'Lockdown, station services restricted'
  },
  Retreat: {
    description: 'Controlling faction retreating from system'
  }
}

export default function SystemMap ({ system, setSystemObject }) {
  if (!system) return null

  return (
    <>
      <div className='system-map'>
        <div className='system-map__title'>
          <h1>
            <span className='fx-animated-text' data-fx-order='1'>
              <i className='icon icarus-terminal-system-orbits' />
              <CopyOnClick>{system.name}</CopyOnClick>
            </span>
          </h1>
          {system.detail && system.detail.bodies && system.detail.bodies.length > 0 &&
            <h3 className='text-primary'>
              <span className='fx-animated-text' data-fx-order='2'>
                {system.detail.bodies.length} {system.detail.bodies.length === 1 ? 'body found in system' : 'bodies found in system'}
              </span>
            </h3>}
          {system.state && system.state !== 'Unknown' && system.state !== 'None' &&
            <h3 className='text-info'>
              <span className='fx-animated-text' data-fx-order='3'>
                {factionState[system.state]?.description ? <>{factionState[system.state].description}</> : system.state}
              </span>
            </h3>}
          {system.allegiance && system.allegiance !== 'Unknown' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='4'>
                {system.allegiance && system.allegiance !== 'Unknown' && system.allegiance}
                {system.government && system.government !== 'None' && system.government !== 'Unknown' && <><span className='seperator' />{system.government}</>}
                {(system.government && system.government !== 'None' && system.government !== 'Unknown' && system.government !== 'Anarchy' && system.security !== system.government) ? <><span className='seperator' />{system.security}</> : ''}
              </span>
            </h3>}
          {system.economy && system.economy?.primary !== 'Unknown' && system?.economy?.primary !== 'None' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='5'>
                {system.economy.primary}
                {system.economy.secondary && system.economy.secondary !== 'Unknown' && system.economy.secondary !== 'None' && ` & ${system.economy.secondary}`}
                {' '}Economy
              </span>
            </h3>}
          {system.faction && system.faction !== 'Unknown' &&
            <h3 className='text-info text-muted'>
              <span className='fx-animated-text' data-fx-order='6'>
                Authority: {system.faction}
              </span>
            </h3>}
        </div>
        {system?.stars?.map(star =>
          <SystemMapStar
            key={`system-map_${system.name}_${star.name}_${star.id}`}
            star={star}
            setSystemObject={setSystemObject}
          />
        )}
      </div>
    </>
  )
}
