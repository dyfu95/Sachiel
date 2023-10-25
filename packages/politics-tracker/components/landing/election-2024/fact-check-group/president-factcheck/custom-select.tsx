import React, { useState } from 'react'
import styled from 'styled-components'

import { useFactCheckPresident } from '~/components/landing/react-context/use-landing-2024'
import { Z_INDEX } from '~/constants'
import CloseCross from '~/public/icons/close-cross.svg'
import DropdownArrow from '~/public/icons/landing/dropdown-arrow.svg'
import { PoliticCategory } from '~/types/politics-detail'

const Container = styled.div`
  outline: 2px solid ${({ theme }) => theme.borderColor.black};
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 280px;
  height: 45px;
  margin: 0px auto 25px;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 1.8;

  ${({ theme }) => theme.breakpoint.md} {
    margin: 0px auto 20px;
  }

  ${({ theme }) => theme.breakpoint.xl} {
    margin: 0px;
  }

  .subtitle {
    box-shadow: -2px 0px 0px 0px #000 inset;
    color: ${({ theme }) => theme.textColor.white};
    background: ${({ theme }) => theme.textColor.yellow};
    padding: 8px 12px;
    min-width: 60px;
  }
`

const DropdownWrapper = styled.div`
  position: relative;
  width: 100%;
`

const SelectedBox = styled.div<{ isOpen: boolean }>`
  padding: 8px 12px;
  background: ${({ theme }) => theme.textColor.white};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`

const LightBox = styled.div<{ isOpen: boolean }>`
  transition: transform 0.4s, opacity 0.1s;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.66);
  padding: 12px;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.top};
`

const Options = styled.div`
  padding: 12px 16px 0px 16px;
  align-items: flex-start;
  border-radius: 4px;
  background: #ffffff;
  width: 100%;
  max-width: 688px;

  ${({ theme }) => theme.breakpoint.md} {
    padding: 20px 40px 40px;
  }
`

const Title = styled.div`
  color: #0f2d35;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  line-height: 1.3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  svg {
    cursor: pointer;
  }
`

const Lists = styled.ul`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  max-height: 420px;
  overflow-y: scroll;

  ${({ theme }) => theme.breakpoint.md} {
    gap: 12px 16px;
    overflow-y: hidden;
    max-height: none;
  }
`

const CategoryItem = styled.div`
  padding: 4px 16px;
  border-radius: 32px;
  border: 1px solid #b2800d;
  width: fit-content;
  cursor: pointer;
  color: #b2800d;

  &:hover {
    background-color: #fffcf3;
  }

  ${({ theme }) => theme.breakpoint.md} {
    padding: 6px 20px;
  }
`

type DropdownProps = {
  selectedCategory: PoliticCategory
  // eslint-disable-next-line
  setSelectedCategory: (value: PoliticCategory) => void
}
export default function CustomSelect({
  selectedCategory,
  setSelectedCategory,
}: DropdownProps): JSX.Element {
  const { categories } = useFactCheckPresident()
  const [isOpen, setIsOpen] = useState(false)

  //FIXME: type any
  const handleOptionClick = (option: PoliticCategory) => {
    setSelectedCategory(option)
    setIsOpen(false)
  }

  return (
    <Container>
      <span className="subtitle">分類</span>

      <DropdownWrapper>
        <SelectedBox onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
          <p>{selectedCategory.name}</p>
          <DropdownArrow onClick={() => setIsOpen(!isOpen)} />
        </SelectedBox>

        <LightBox isOpen={isOpen}>
          <Options>
            <Title>
              請選擇分類
              <CloseCross onClick={() => setIsOpen(!isOpen)} />
            </Title>

            <Lists>
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  className="item"
                  onClick={() => handleOptionClick(category)}
                >
                  {category.name}
                </CategoryItem>
              ))}
            </Lists>
          </Options>
        </LightBox>
      </DropdownWrapper>
    </Container>
  )
}