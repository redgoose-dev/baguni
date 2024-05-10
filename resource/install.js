import { exit } from 'node:process'
import { rm, mkdir, exists } from 'node:fs/promises'
import { Database } from 'bun:sqlite'
import { message, basePath, prompt, multiplePrompt } from './libs.js'
// import {} from '../server/libs/dates.js'

// TODO: 실행
// TODO: 인스톨 할지 물어보기 ? 인스톨 진행 : 프로그램 종료
// TODO: user 디렉토리와 데이터베이스가 존재하는지 검사 ? (기존 데이터를 삭제할건지 물어보기 ? 디렉토리와 DB 삭제 : EXIT) : NEXT
// TODO: user 디렉토리 만들기
// TODO: DB 설치
// TODO: 관리자 데이터가 있나 ? NEXT : (관리자 정보 입력 -> 관리자 데이터 추가)
// TODO: 인스톨 완료 메시지 출력

const { VITE_DIR_DB, VITE_DIR_UPLOAD } = import.meta.env
const paths = {
  seedDb: `resource/seed.sql`,
  db: `${basePath}/db.sqlite`,
}
const pathList = [
  `${basePath}/original`,
  `${basePath}/cover`,
  `${basePath}/cache`,
]
let db

/**
 * 진행할것인지에 대한 확인
 * @return {Promise}
 */
async function confirm()
{
  let answer = await prompt('Do you really want to install? [y/N]')
  if (answer.toLowerCase() !== 'y')
  {
    message('error', 'You canceled the install.')
    exit()
  }
}

/**
 * check directories
 * @return {Promise<boolean>}
 */
async function checkData()
{
  let installed = true
  const res = await Promise.all([
    ...(pathList.map(path => exists(path))),
    exists(paths.db),
  ])
  installed = res.includes(true) // 경로가 하나라도 만들어져 있으면 인스톨이 되어있다고 간주한다.
  if (installed)
  {
    const confirmDeleteData = await prompt('설치되어있는 데이터를 삭제할까요? [y/N]')
    if (confirmDeleteData.toLowerCase() === 'y')
    {
      // 설치된 데이터를 삭제한다.
      await rm(basePath, { recursive: true })
    }
    else
    {
      // 데이터가 존재하는데 삭제한다고 선택하지 않았으니 진행을 종료한다.
      message('error', `Can't proceed because the data already exists.`)
      exit()
    }
  }
  message('run', 'Checking data.')
}

/**
 * create directories
 * @return {Promise<void>}
 */
async function createDirectories()
{
  await Promise.all(pathList.map(path => {
    return mkdir(path, { recursive: true })
  }))
  message('run', 'Create data directories.')
}

/**
 * create database
 * @return {Promise<void>}
 */
async function createDatabase()
{
  try
  {
    db = new Database(paths.db, {
      create: true,
    })
    let seed = Bun.file(paths.seedDb)
    seed = await seed.text()
    db.exec(seed)
    message('run', 'Create database.')
  }
  catch (e)
  {
    message('error', e.message)
    exit()
  }
}

/**
 * 관리자 유저 추가
 */
async function addUser()
{
  message('run', 'Enter admin information.')
  const [ email, name, password ] = await multiplePrompt([
    '✏️ E-Mail:',
    '✏️ Username:',
    '✏️ Password:',
  ])
  try
  {
    const sql = `insert into user (email, name, password, regdate) values (?, ?, ?, CURRENT_TIMESTAMP)`
    // TODO: 비밀번호는 암호화 하자. bcrypt 패키지 활용하면 될듯..
    db.run(sql, [ email, name, password ])
  }
  catch (e)
  {
    message('error', e.message)
    db.close()
    exit()
  }
  message('run', `You've entered your admin information.`)
}

// actions
await confirm()
await checkData()
await createDirectories()
await createDatabase()
await addUser()
db.close()
message('exit', 'Complete install')
exit()
