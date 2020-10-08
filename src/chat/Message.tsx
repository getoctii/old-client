import React, { useEffect, memo, ReactChildren } from 'react'
import styles from './Message.module.scss'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import { useMeasure } from 'react-use'

const ImageEmbed = ({
  children,
  onResize
}: {
  children: ReactChildren
  onResize: () => void
}) => {
  const [ref, size] = useMeasure<HTMLDivElement>()
  useEffect(() => {
    onResize()
  }, [size, onResize])
  return <div ref={ref}>{children}</div>
}

const Message = memo(
  ({
    children,
    avatar,
    timestamp,
    author,
    primary,
    onResize
  }: {
    children: string
    avatar: string
    timestamp: string
    author: string
    primary: boolean
    onResize: () => void
  }) => {
    return (
      <div className={primary ? styles.primary : styles.message}>
        {primary && (
          <img
            className={styles.avatar}
            src={avatar}
            alt={`${author}'s Profile`}
          />
        )}
        <div className={`${styles.content} ${!primary ? styles.spacer : ''}`}>
          {primary && (
            <h2 key='username'>
              {author}
              <span>{moment.utc(timestamp).local().calendar()}</span>
            </h2>
          )}
          <ReactMarkdown
            skipHtml={false}
            escapeHtml={true}
            unwrapDisallowed={true}
            allowedTypes={[
              'root',
              'text',
              'paragraph',
              'strong',
              'emphasis',
              'delete',
              'link',
              'heading'
            ]}
            renderers={{
              heading: (props) => <p>{props.children}</p>,
              paragraph: (props) => {
                const content = props.children.flatMap(
                  (child: any, index: number) =>
                    typeof child === 'object' &&
                    child.key &&
                    !!child.key.match(/link/g) ? (
                      /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)/g.test(
                        child.props.href
                      ) ? (
                        [
                          <p>{child}</p>,
                          <div className={styles.imageEmbed}>
                            <img
                              alt='chat'
                              src={
                                child.props.href.match(
                                  /^https:\/\/file\.coffee\/u\/[a-zA-Z0-9_-]{7,14}\.(png|jpeg|jpg|gif)$/g
                                )?.[0]
                              }
                            />
                          </div>
                        ]
                      ) : (
                        <p>{child}</p>
                      )
                    ) : (
                      <p>{child}</p>
                    )
                )
                const paragraphs = content.filter((e: any) => e.type === 'p')
                const images = content.filter((e: any) => e.type === 'div')
                return (
                  <>
                    {[
                      <div key='text'>
                        <p>
                          {paragraphs.flatMap((p: any) => p.props.children)}
                        </p>
                      </div>,
                      <ImageEmbed key='images' onResize={onResize}>
                        {images.map((img: any, index: any) => (
                          <div {...img.props} key={index} />
                        ))}
                      </ImageEmbed>
                    ]}
                  </>
                )
              },
              link: (props) => (
                <a href={props.href} target='_blank' rel='noopener noreferrer'>
                  {props.children}
                </a>
              )
            }}
            source={children}
          />
        </div>
      </div>
    )
  }
)

export default Message
