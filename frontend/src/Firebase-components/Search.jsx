import React from 'react'
import UserLists from '../components/UserLists'

export default function Search({currentUser}) {
  return (
    <div>
      <UserLists currentUser={currentUser}/>
    </div>
  )
}
