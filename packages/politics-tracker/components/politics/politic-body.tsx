import type { Politic } from '~/types/politics'
import { useState } from 'react'
import classNames from 'classnames'
import { SOURCE_DELIMITER } from '~/constants/politics'
import SourceItem from './source-item'
import PoliticForm from './politic-form'
import Edit from '~/components/icons/edit'
import s from './politic-body.module.css'

type PoliticBodyProps = Politic & { no: number }

export default function PoliticBody(props: PoliticBodyProps): JSX.Element {
  const [isEditing, setEditing] = useState<boolean>(false)
  const index = String(props.no).padStart(2, '0')
  const sources = props.source.split(SOURCE_DELIMITER)
  const sourceList = sources.map((s, i) => (
    <SourceItem key={i} no={i + 1} content={s} />
  ))

  const style = classNames(s['container'], { [s['editing']]: isEditing })

  return (
    <div className={style}>
      <span className={s['index']}>{index}</span>
      <div className={s['content-group']}>
        {isEditing ? (
          <PoliticForm
            politic={props}
            closeForm={() => setEditing(false)}
            submitForm={(data) => {}}
          />
        ) : (
          <>
            <div className={s['content']}>{props.desc}</div>
            <div className={s['source-group']}>
              <div className={s['source-label']}>來源</div>
              <div className={s['source-list']}>{sourceList}</div>
            </div>
            <div className={s['button-edit']} onClick={() => setEditing(true)}>
              <div className={s['button-inner']}>
                <span>編輯</span>
                <span>
                  <Edit />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}