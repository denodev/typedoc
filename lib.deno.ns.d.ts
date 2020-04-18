// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />

declare namespace Deno {
  /** 当前正在运行的进程 ID。 */
  export let pid: number;

  /** 显示环境变量 `NO_COLOR` 的值。
   *
   * See: https://no-color.org/ */
  export let noColor: boolean;

  export interface TestDefinition {
    fn: () => void | Promise<void>;
    name: string;
    ignore?: boolean;
    disableOpSanitizer?: boolean;
    disableResourceSanitizer?: boolean;
  }

  /** 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。如果需要， `fn` 可以是异步的。
   *
   *          import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *          Deno.test({
   *            name: "example test",
   *            fn(): void {
   *              assertEquals("world", "world");
   *            },
   *          });
   *
   *          Deno.test({
   *            name: "example ignored test",
   *            ignore: Deno.build.os === "win"
   *            fn(): void {
   *              // 仅在 Windows 机器上忽略这个测试。
   *            },
   *          });
   *
   *          Deno.test({
   *            name: "example async test",
   *            async fn() {
   *              const decoder = new TextDecoder("utf-8");
   *              const data = await Deno.readFile("hello_world.txt");
   *              assertEquals(decoder.decode(data), "Hello world")
   *            }
   *          });
   */
  export function test(t: TestDefinition): void;

  /** 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。
   *
   *        import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *        Deno.test(function myTestFunction():void {
   *          assertEquals("hello", "hello");
   *        });
   *
   *        Deno.test(async function myAsyncTestFunction():Promise<void> {
   *          const decoder = new TextDecoder("utf-8");
   *          const data = await Deno.readFile("hello_world.txt");
   *          assertEquals(decoder.decode(data), "Hello world")
   *        });
   **/
  export function test(fn: () => void | Promise<void>): void;

  /** 注册一个测试，它将在命令行执行 `deno test` 操作并且包含的模块看起来像一个测试模块时运行，
   * 或者在使用 `Deno.runTests` 时显式运行。
   *
   *        import {assert, fail, assertEquals} from "https://deno.land/std/testing/asserts.ts";
   *
   *        Deno.test("My test description", ():void => {
   *          assertEquals("hello", "hello");
   *        });
   *
   *        Deno.test("My async test description", async ():Promise<void> => {
   *          const decoder = new TextDecoder("utf-8");
   *          const data = await Deno.readFile("hello_world.txt");
   *          assertEquals(decoder.decode(data), "Hello world")
   *        });
   * */
  export function test(name: string, fn: () => void | Promise<void>): void;

  export interface TestMessage {
    start?: {
      tests: TestDefinition[];
    };
    testStart?: {
      [P in keyof TestDefinition]: TestDefinition[P];
    };
    testEnd?: {
      name: string;
      status: "passed" | "failed" | "ignored";
      duration: number;
      error?: Error;
    };
    end?: {
      filtered: number;
      ignored: number;
      measured: number;
      passed: number;
      failed: number;
      duration: number;
      results: Array<TestMessage["testEnd"] & {}>;
    };
  }

  export interface RunTestsOptions {
    /**
     * 如果为 `true`，当测试失败时 Deno 将以状态码 1 退出。
     *
     * 默认为 `true`。
     */
    exitOnFail?: boolean;
    /** 如果为 `true`，Deno 将在第一次测试失败后退出。默认值为 `false` */
    failFast?: boolean;
    /** 用于筛选要运行的测试的字符串或正则表达式。只有当测试名称与提供的 `String` 或 `RegExp` 相匹配时才会运行。*/
    filter?: string | RegExp;
    /** 用于跳过要运行的测试的字符串或正则表达式。当测试名称与提供的 `String` 或 `RegExp` 相匹配时将不会运行。 */
    skip?: string | RegExp;
    /** 禁用记录结果. 默认值为 `false`。 */
    disableLog?: boolean;
    /** 如果为 `true`，将 `deno test` 完成的结果输出到控制台。默认值为 `true`. */
    reportToConsole?: boolean;
    /** 回调从测试运行收到的每个消息。 */
    onMessage?: (message: TestMessage) => void | Promise<void>;
  }

  /** 运行所有通过 `Deno.test()` 注册的测试。始终异步 resolve。
   *
   *        // 注册一个测试。
   *        Deno.test({
   *          name: "example test",
   *          fn(): void {
   *            assertEquals("world", "world");
   *            assertEquals({ hello: "world" }, { hello: "world" });
   *          },
   *        });
   *
   *        // 运行所有已经注册过的测试。
   *        const runInfo = await Deno.runTests();
   *        console.log(runInfo.duration);  // all tests duration, e.g. "5" (in ms)
   *        console.log(runInfo.stats.passed);  // e.g. 1
   *        console.log(runInfo.results[0].name);  // e.g. "example test"
   */
  export function runTests(
    opts?: RunTestsOptions
  ): Promise<TestMessage["end"]> & {};

  /** 返回 1 分钟、5 分钟和 15 分钟平均负载的数组。
   * 平均负载是对最后 1 分钟、5 分钟和 15 分钟的 CPU 以及 IO 利用率的度量，以分数表示。
   * `0` 表示没有负载。
   * 在 Windows 上，这 3 个值始终相同，代表当前负载，而不是 1 分钟、5 分钟和 15 分钟的平均负载。
   *
   *       console.log(Deno.loadavg());  // e.g. [ 0.71, 0.44, 0.44 ]
   *
   * 需要 `allow-env` 权限。
   */
  export function loadavg(): number[];

  /** 获取 Deno 进程所在的计算机主机名(`hostname`)。
   *
   *       console.log(Deno.hostname());
   *
   *  需要 `allow-env` 权限。
   */
  export function hostname(): string;

  /** 返回操作系统的发行版本。
   *
   *       console.log(Deno.osRelease());
   *
   * 需要 `allow-env` 权限。
   */
  export function osRelease(): string;

  /** 退出 Deno 进程，可以指定退出码，若无则为 0。
   *
   *       Deno.exit(5);
   */
  export function exit(code?: number): never;

  /** 返回调用时环境变量的快照。如果更改环境变量对象的属性，则会在进程的环境中设置该属性。
   * 环境变量对象只接受 `string` 类型的值。
   *
   *       const myEnv = Deno.env();
   *       console.log(myEnv.SHELL);
   *       myEnv.TEST_VAR = "HELLO";
   *       const newEnv = Deno.env();
   *       console.log(myEnv.TEST_VAR === newEnv.TEST_VAR);  // outputs "true"
   *
   * 需要 `allow-env` 权限 */
  export function env(): {
    [index: string]: string;
  };

  /** 获取环境变量的值。如果 `key` 不存在，则返回 `undefined`。
   *
   *       console.log(Deno.env("HOME"));  // e.g. outputs "/home/alice"
   *       console.log(Deno.env("MADE_UP_VAR"));  // outputs "Undefined"
   *
   * 需要 `allow-env` 权限 */
  export function env(key: string): string | undefined;

  /** **UNSTABLE** */
  export type DirKind =
    | "home"
    | "cache"
    | "config"
    | "executable"
    | "data"
    | "data_local"
    | "audio"
    | "desktop"
    | "document"
    | "download"
    | "font"
    | "picture"
    | "public"
    | "template"
    | "tmp"
    | "video";

  /**
   * **不稳定**: 当前正在评估中，以确定是否应重命名方法名 `dir` 和参数类型 `DirKind`。
   *
   * 返回特定于用户和平台的目录。
   *
   *       const homeDirectory = Deno.dir("home");
   *
   * 需要 `allow-env` 权限。
   *
   * 如果没有适用的目录或发生任何其他错误，则返回 `null`。
   *
   * 参数值包含：`"home"`, `"cache"`, `"config"`, `"executable"`, `"data"`,
   * `"data_local"`, `"audio"`, `"desktop"`, `"document"`, `"download"`,
   * `"font"`, `"picture"`, `"public"`, `"template"`, `"tmp"`, `"video"`
   *
   * `"home"`
   *
   * |平台      | 值                                       | 示例                    |
   * | ------- | -----------------------------------------| -----------------------|
   * | Linux   | `$HOME`                                  | /home/alice            |
   * | macOS   | `$HOME`                                  | /Users/alice           |
   * | Windows | `{FOLDERID_Profile}`                     | C:\Users\Alice         |
   *
   * `"cache"`
   *
   * |平台      | 值                                  | 示例                          |
   * | ------- | ----------------------------------- | ---------------------------- |
   * | Linux   | `$XDG_CACHE_HOME` or `$HOME`/.cache | /home/alice/.cache           |
   * | macOS   | `$HOME`/Library/Caches              | /Users/Alice/Library/Caches  |
   * | Windows | `{FOLDERID_LocalAppData}`           | C:\Users\Alice\AppData\Local |
   *
   * `"config"`
   *
   * |平台      | 值                                    | 示例                              |
   * | ------- | ------------------------------------- | -------------------------------- |
   * | Linux   | `$XDG_CONFIG_HOME` or `$HOME`/.config | /home/alice/.config              |
   * | macOS   | `$HOME`/Library/Preferences           | /Users/Alice/Library/Preferences |
   * | Windows | `{FOLDERID_RoamingAppData}`           | C:\Users\Alice\AppData\Roaming   |
   *
   * `"executable"`
   *
   * |平台      | 值                                                              | 示例                    |
   * | ------- | --------------------------------------------------------------- | -----------------------|
   * | Linux   | `XDG_BIN_HOME` or `$XDG_DATA_HOME`/../bin or `$HOME`/.local/bin | /home/alice/.local/bin |
   * | macOS   | -                                                               | -                      |
   * | Windows | -                                                               | -                      |
   *
   * `"data"`
   *
   * |平台      | 值                                       | 示例                                      |
   * | ------- | ---------------------------------------- | ---------------------------------------- |
   * | Linux   | `$XDG_DATA_HOME` or `$HOME`/.local/share | /home/alice/.local/share                 |
   * | macOS   | `$HOME`/Library/Application Support      | /Users/Alice/Library/Application Support |
   * | Windows | `{FOLDERID_RoamingAppData}`              | C:\Users\Alice\AppData\Roaming           |
   *
   * `"data_local"`
   *
   * |平台      | 值                                       | 示例                                      |
   * | ------- | ---------------------------------------- | ---------------------------------------- |
   * | Linux   | `$XDG_DATA_HOME` or `$HOME`/.local/share | /home/alice/.local/share                 |
   * | macOS   | `$HOME`/Library/Application Support      | /Users/Alice/Library/Application Support |
   * | Windows | `{FOLDERID_LocalAppData}`                | C:\Users\Alice\AppData\Local             |
   *
   * `"audio"`
   *
   * |平台      | 值                 | 示例                  |
   * | ------- | ------------------ | -------------------- |
   * | Linux   | `XDG_MUSIC_DIR`    | /home/alice/Music    |
   * | macOS   | `$HOME`/Music      | /Users/Alice/Music   |
   * | Windows | `{FOLDERID_Music}` | C:\Users\Alice\Music |
   *
   * `"desktop"`
   *
   * |平台      | 值                   | 示例                    |
   * | ------- | -------------------- | ---------------------- |
   * | Linux   | `XDG_DESKTOP_DIR`    | /home/alice/Desktop    |
   * | macOS   | `$HOME`/Desktop      | /Users/Alice/Desktop   |
   * | Windows | `{FOLDERID_Desktop}` | C:\Users\Alice\Desktop |
   *
   * `"document"`
   *
   * |平台      | 值                     | 示例                      |
   * | ------- | ---------------------- | ------------------------ |
   * | Linux   | `XDG_DOCUMENTS_DIR`    | /home/alice/Documents    |
   * | macOS   | `$HOME`/Documents      | /Users/Alice/Documents   |
   * | Windows | `{FOLDERID_Documents}` | C:\Users\Alice\Documents |
   *
   * `"download"`
   *
   * |平台      | 值                     | 示例                      |
   * | ------- | ---------------------- | ------------------------ |
   * | Linux   | `XDG_DOWNLOAD_DIR`     | /home/alice/Downloads    |
   * | macOS   | `$HOME`/Downloads      | /Users/Alice/Downloads   |
   * | Windows | `{FOLDERID_Downloads}` | C:\Users\Alice\Downloads |
   *
   * `"font"`
   *
   * |平台      | 值                                                   | 示例                           |
   * | ------- | ---------------------------------------------------- | ------------------------------ |
   * | Linux   | `$XDG_DATA_HOME`/fonts or `$HOME`/.local/share/fonts | /home/alice/.local/share/fonts |
   * | macOS   | `$HOME/Library/Fonts`                                | /Users/Alice/Library/Fonts     |
   * | Windows | –                                                    | –                              |
   *
   * `"picture"`
   *
   * |平台      | 值                    | 示例                     |
   * | ------- | --------------------- | ----------------------- |
   * | Linux   | `XDG_PICTURES_DIR`    | /home/alice/Pictures    |
   * | macOS   | `$HOME`/Pictures      | /Users/Alice/Pictures   |
   * | Windows | `{FOLDERID_Pictures}` | C:\Users\Alice\Pictures |
   *
   * `"public"`
   *
   * |平台      | 值                    | 示例                 |
   * | ------- | --------------------- | ------------------- |
   * | Linux   | `XDG_PUBLICSHARE_DIR` | /home/alice/Public  |
   * | macOS   | `$HOME`/Public        | /Users/Alice/Public |
   * | Windows | `{FOLDERID_Public}`   | C:\Users\Public     |
   *
   * `"template"`
   *
   * |平台      | 值                     | 示例                                                       |
   * | ------- | ---------------------- | ---------------------------------------------------------- |
   * | Linux   | `XDG_TEMPLATES_DIR`    | /home/alice/Templates                                      |
   * | macOS   | –                      | –                                                          |
   * | Windows | `{FOLDERID_Templates}` | C:\Users\Alice\AppData\Roaming\Microsoft\Windows\Templates |
   *
   * `"tmp"`
   *
   * |平台      | 值                     | 示例                                                        |
   * | ------- | ---------------------- | ---------------------------------------------------------- |
   * | Linux   | `TMPDIR`               | /tmp                                                       |
   * | macOS   | `TMPDIR`               | /tmp                                                       |
   * | Windows | `{TMP}`                | C:\Users\Alice\AppData\Local\Temp                          |
   *
   * `"video"`
   *
   * |平台      | 值                  | 示例                   |
   * | ------- | ------------------- | --------------------- |
   * | Linux   | `XDG_VIDEOS_DIR`    | /home/alice/Videos    |
   * | macOS   | `$HOME`/Movies      | /Users/Alice/Movies   |
   * | Windows | `{FOLDERID_Videos}` | C:\Users\Alice\Videos |
   *
   */
  export function dir(kind: DirKind): string | null;

  /**
   * 返回当前 deno 可执行文件的路径。
   *
   *       console.log(Deno.execPath());  // e.g. "/home/alice/.local/bin/deno"
   *
   * 需要 `allow-env` 权限。
   */
  export function execPath(): string;

  /**
   * **不稳定**: 获取当前工作目录是否需要明确的权限，目前正在评估中。
   *
   * 返回当前工作目录的字符串。
   *
   * 如果当前目录可以通过多个路径访问（由于符号链接导致），可能会返回其中任意一个。
   *
   *       const currentWorkingDirectory = Deno.cwd();
   *
   * 如果目录不存在，则抛出 `Deno.errors.NotFound`。
   */
  export function cwd(): string;

  /**
   * **不稳定**: 更改当前工作目录是否需要明确的权限，目前正在评估中。
   *
   * 将当前工作目录更改为指定路径。
   *
   *       Deno.chdir("/home/userA");
   *       Deno.chdir("../userB");
   *       Deno.chdir("C:\\Program Files (x86)\\Java");
   *
   * 如果目录未被找到，则抛出 `Deno.errors.NotFound` 。
   * 如果用户没有访问权限，则抛出 `Deno.errors.PermissionDenied` 。
   */
  export function chdir(directory: string): void;

  /**
   * **不稳定**: 新 API，没有经过审查。正在考虑调用此 API 时，是否需要申请权限。
   *
   * 获取进程权限掩码。如果提供 `mask`，则设置进程权限掩码。
   * 此函数始终返回调用前的权限掩码。
   *
   *        console.log(Deno.umask());  // e.g. 18 (0o022)
   *        const prevUmaskValue = Deno.umask(0o077);  // e.g. 18 (0o022)
   *        console.log(Deno.umask());  // e.g. 63 (0o077)
   *
   * 注意: 此 API 未在 Windows 平台实现。
   */
  export function umask(mask?: number): number;

  /** **不稳定**: 可能会移动到 `Deno.symbols`。 */
  export const EOF: unique symbol;
  export type EOF = typeof EOF;

  /** **不稳定**: 可能会移除 `"SEEK_"` 前缀。可能不使用全大写。 */
  export enum SeekMode {
    SEEK_START = 0,
    SEEK_CURRENT = 1,
    SEEK_END = 2,
  }

  /** **UNSTABLE**: might make `Reader` into iterator of some sort. */
  export interface Reader {
    /** Reads up to `p.byteLength` bytes into `p`. It resolves to the number of
     * bytes read (`0` < `n` <= `p.byteLength`) and rejects if any error
     * encountered. Even if `read()` resolves to `n` < `p.byteLength`, it may
     * use all of `p` as scratch space during the call. If some data is
     * available but not `p.byteLength` bytes, `read()` conventionally resolves
     * to what is available instead of waiting for more.
     *
     * When `read()` encounters end-of-file condition, it resolves to
     * `Deno.EOF` symbol.
     *
     * When `read()` encounters an error, it rejects with an error.
     *
     * Callers should always process the `n` > `0` bytes returned before
     * considering the `EOF`. Doing so correctly handles I/O errors that happen
     * after reading some bytes and also both of the allowed EOF behaviors.
     *
     * Implementations should not retain a reference to `p`.
     */
    /** 最多读取 `p.byteLength` 个字节到p中，然后返回读取的字节数（`0 < n <= p.byteLength`），并在遇到任何错误时返回拒绝状态的回调函数。
     * 即使 `read()` 返回值为 `n < p.byteLength`，p也可能在调用期间被用作临时空间。
     * 如果有数据可用，但不存在 `p.byteLength`，`read()` 通常会返回可用值，而不是等待更多。
     *
     * 当 `read()` 遇到文件结束条件时，将返回 `Deno.EOF` 符号。
     *
     * 当 `read()` 遇到错误时，它会返回拒绝状态的回调函数，参数值为错误信息。
     *
     * 调用者应始终处理返回值为 `n > 0` 的情况，然后再考虑 `EOF`。
     * 应正确处理在读取一些字节以及两种被允许的EOF行为之后可能发生的 I/O 错误。
     *
     * 实现不应保留对 `p` 的引用。
     */
    read(p: Uint8Array): Promise<number | EOF>;
  }

  export interface SyncReader {
    /** 最多读取 `p.byteLength` 个字节到p中，然后返回读取的字节数（`0 < n <= p.byteLength`），并在遇到任何错误时返回拒绝状态的回调函数。
     * 即使 `readSync()` 返回值为 `n < p.byteLength`，p也可能在调用期间被用作临时空间。
     * 如果有数据可用，但不存在 `p.byteLength`，`readSync()` 通常会返回可用值，而不是等待更多。
     *
     * 当 `readSync()` 遇到文件结束条件时，将返回 `Deno.EOF` 符号。
     *
     * 当 `readSync()` 遇到错误时，它会返回拒绝状态的回调函数，参数值为错误信息。
     *
     * 调用者应始终处理返回值为 `n > 0` 的情况，然后再考虑 `EOF`。
     * 应正确处理在读取一些字节以及两种被允许的EOF行为之后可能发生的 I/O 错误。
     *
     * 实现不应保留对 `p` 的引用。
     */
    readSync(p: Uint8Array): number | EOF;
  }

  export interface Writer {
    /**
     * 将 `p` 中的 `p.byteLength` 字节写入底层数据流。 它 resolve 时返回值为从 `p` 写入的
     * 字节数(`0` <= `n` <= `p.byteLength`），reject 时返回值为导致写入提前停止的错误。
     * 如果将要 resolve 一个 `n` < `p.byteLength` 的值时， `write()` 必须 reject，并且返回
     * 一个非空错误。`write()` 禁止修改分片数据，即使是临时修改。
     *
     * 实现不应保留对 `p` 的引用。
     */
    write(p: Uint8Array): Promise<number>;
  }

  export interface SyncWriter {
    /**
     * 将 `p` 中的 `p.byteLength` 字节写入底层数据流。它的返回值为从 `p` 写入的
     * 字节数(`0` <= `n` <= `p.byteLength`）或者导致写入提前停止的错误。
     * `writeSync()` 会抛出一个非空错误当返回值 `n` < `p.byteLength`。`writeSync()`
     * 禁止修改分片数据，即使是临时修改。
     *
     * 实现不应保留对 `p` 的引用。
     */
    writeSync(p: Uint8Array): number;
  }

  export interface Closer {
    close(): void;
  }

  export interface Seeker {
    /** 设置下一个 `read()` 或 `write()` 的偏移量，根据 `whence` 进行决定从哪个位置开始偏移：
     * `SEEK_START` 表示相对于文件开头，`SEEK_CURRENT` 表示相对于当前位置，`SEEK_END` 表示相对于文件末尾。
     * Seek 解析（resolve）的值为相对于文件开头的新偏移量。
     *
     * 把偏移量设置到文件开始之前是错误的。
     * 设置任何正偏移都是合法的，但是对于之后的 I/O 操作的行为则取决于实现。
     * 它返回设置之后的偏移位置。
     */
    seek(offset: number, whence: SeekMode): Promise<number>;
  }

  export interface SyncSeeker {
    /** 设置下一个 `read()` 或 `write()` 的偏移量，根据 `whence` 进行决定从哪个位置开始偏移：
     * `SEEK_START` 表示相对于文件开头，`SEEK_CURRENT` 表示相对于当前位置，`SEEK_END` 表示相对于文件末尾。
     *
     * 把偏移量设置到文件开始之前是错误的。
     * 设置任何正偏移都是合法的，但是对于之后的 I/O 操作的行为则取决于实现。
     */
    seekSync(offset: number, whence: SeekMode): number;
  }

  export interface ReadCloser extends Reader, Closer {}
  export interface WriteCloser extends Writer, Closer {}
  export interface ReadSeeker extends Reader, Seeker {}
  export interface WriteSeeker extends Writer, Seeker {}
  export interface ReadWriteCloser extends Reader, Writer, Closer {}
  export interface ReadWriteSeeker extends Reader, Writer, Seeker {}

  /** 从 `src` 拷贝文件至 `dst`，拷贝至 `src` 的 `EOF` 或有异常出现时结束。
   * `copy()` 函数返回一个 `Promise`, 成功时 resolve 并返回拷贝的字节数，失败时 reject 并返回拷贝过程中的首个异常
   *
   *       const source = await Deno.open("my_file.txt");
   *       const buffer = new Deno.Buffer()
   *       const bytesCopied1 = await Deno.copy(Deno.stdout, source);
   *       const bytesCopied2 = await Deno.copy(buffer, source);
   *
   * 因为 `copy()` 函数在读到 `EOF` 时停止，所以不会将 `EOF` 视为异常（区别于 `read()` 函数）。
   *
   * @param dst 需要拷贝至的目标位置
   * @param src 拷贝的源位置
   */
  export function copy(dst: Writer, src: Reader): Promise<number>;

  /** 将 Reader 对象 (`r`) 转换为异步迭代器。
   *
   *      for await (const chunk of toAsyncIterator(reader)) {
   *        console.log(chunk);
   *      }
   */
  export function toAsyncIterator(r: Reader): AsyncIterableIterator<Uint8Array>;

  /** 用同步方式打开一个文件并返回一个 `Deno.File` 实例。如果使用了 `create` 或 `createNew`配置项
   * 文件可以不需要预先存在。调用者应该在完成后关闭文件。
   *
   *       const file = Deno.openSync("/foo/bar.txt", { read: true, write: true });
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * 根据不同的配置需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function openSync(path: string, options?: OpenOptions): File;

  /** 用同步方式打开一个文件并返回一个 `Deno.File` 实例。根据传入的模式，可以创建文件。
   * 调用者应该在完成后关闭文件。
   *
   *       const file = Deno.openSync("/foo/bar.txt", "r");
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * 根据不同的打开模式需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function openSync(path: string, openMode?: OpenMode): File;

  /** 打开一个文件并异步返回一个 `Deno.File` 实例。如果使用了 `create` 或 `createNew`配置项
   * 文件可以不需要预先存在。调用者应该在完成后关闭文件。
   *
   *       const file = await Deno.open("/foo/bar.txt", { read: true, write: true });
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * 根据不同的配置需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function open(path: string, options?: OpenOptions): Promise<File>;

  /** 打开一个文件并异步返回一个 `Deno.File` 实例。根据传入的模式，可以创建文件。
   * 调用者应该在完成后关闭文件。
   *
   *       const file = await Deno.open("/foo/bar.txt", "w+");
   *       // Do work with file
   *       Deno.close(file.rid);
   *
   * 根据不同的打开模式需要相应的 `allow-read` 及 `allow-write` 权限。
   */
  export function open(path: string, openMode?: OpenMode): Promise<File>;

  /** 创建文件并返回一个 `Deno.File` 实例，如果文件已存在则进行覆盖。
   *
   *       const file = Deno.createSync("/foo/bar.txt");
   *
   * 需要 `allow-read` 和 `allow-write` 权限。
   */
  export function createSync(path: string): File;

  /** 创建文件并异步返回一个 `Deno.File` 实例，如果文件已存在则进行覆盖。
   *
   *       const file = await Deno.create("/foo/bar.txt");
   *
   * 需要 `allow-read` 和 `allow-write` 权限。
   */
  export function create(path: string): Promise<File>;

  /** 同步地从资源ID (`rid`) 读取内容，并写入到数组缓冲区 (`buffer`)。
   *
   * 如果没有要读取的内容，返回值为操作期间读取的字节数，或者文件结尾（`Symbol（EOF）`）。
   *
   *      // 如果 "/foo/bar.txt" 文件里面有 "hello world":
   *      const file = Deno.openSync("/foo/bar.txt");
   *      const buf = new Uint8Array(100);
   *      const numberOfBytesRead = Deno.readSync(file.rid, buf); // 11 bytes
   *      const text = new TextDecoder().decode(buf);  // "hello world"
   *      Deno.close(file.rid);
   */
  export function readSync(rid: number, buffer: Uint8Array): number | EOF;

  /** 从资源ID (`rid`) 读取内容，并写入到数组缓冲区 (`buffer`)。
   *
   * 如果没有要读取的内容，返回值为操作期间读取的字节数，或者文件结尾（`Symbol（EOF）`）。
   *
   *      // 如果 "/foo/bar.txt" 文件里面有 "hello world":
   *      const file = await Deno.open("/foo/bar.txt");
   *      const buf = new Uint8Array(100);
   *      const numberOfBytesRead = await Deno.read(file.rid, buf); // 11 bytes
   *      const text = new TextDecoder().decode(buf);  // "hello world"
   *      Deno.close(file.rid);
   */
  export function read(rid: number, buffer: Uint8Array): Promise<number | EOF>;

  /** 同步地将数组缓冲区 (`data`) 的内容写入资源ID的所属文件 (`rid`) 。
   *
   * 返回写入的字节数。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world");
   *       const file = Deno.openSync("/foo/bar.txt");
   *       const bytesWritten = Deno.writeSync(file.rid, data); // 11
   *       Deno.close(file.rid);
   */
  export function writeSync(rid: number, data: Uint8Array): number;

  /** 将数组缓冲区 (`data`) 的内容写入资源ID的所属文件 (`rid`) 。
   *
   * 解析为写入的字节数。
   *
   *      const encoder = new TextEncoder();
   *      const data = encoder.encode("Hello world");
   *      const file = await Deno.open("/foo/bar.txt");
   *      const bytesWritten = await Deno.write(file.rid, data); // 11
   *      Deno.close(file.rid);
   */
  export function write(rid: number, data: Uint8Array): Promise<number>;

  /** 同步方式，在给定查询模式 `whence` 和偏移量 `offset` 的情况下，查找指定的资源 ID（`rid`）。
   * 函数将解析并返回光标在资源中的新位置（从头开始的字节数）。
   *
   *        const file = Deno.openSync('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        Deno.writeSync(file.rid, new TextEncoder().encode("Hello world"));
   *        // advance cursor 6 bytes
   *        const cursorPosition = Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        file.readSync(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * seek modes 的工作方式如下:
   *
   *        // 给定内容为 "Hello world" 的 file.rid 文件，该文件长度为11个字节。
   *        // 从文件开头移动 6 个字节
   *        console.log(Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START)); // "6"
   *        // 从当前位置再移动 2 个字节
   *        console.log(Deno.seekSync(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); // "8"
   *        // 从文件末尾向后移动 2 个字节
   *        console.log(Deno.seekSync(file.rid, -2, Deno.SeekMode.SEEK_END)); // "9" (e.g. 11-2)
   */
  export function seekSync(
    rid: number,
    offset: number,
    whence: SeekMode
  ): number;

  /** 在给定查询模式 `whence` 和偏移量 `offset` 的情况下，查找指定的资源 ID（`rid`）。
   * 函数将解析并返回光标在资源中的新位置（从头开始的字节数）。
   *
   *        const file = await Deno.open('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        await Deno.write(file.rid, new TextEncoder().encode("Hello world"));
   *        // 光标前进 6 个字节
   *        const cursorPosition = await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        await file.read(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * seek modes 的工作方式如下:
   *
   *        // 给定内容为 "Hello world" 的 file.rid 文件，该文件长度为11个字节。
   *        // 从文件开头移动 6 个字节
   *        console.log(await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START)); // "6"
   *        // 从当前位置再移动 2 个字节
   *        console.log(await Deno.seek(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); // "8"
   *        // 从文件末尾向后移动 2 个字节
   *        console.log(await Deno.seek(file.rid, -2, Deno.SeekMode.SEEK_END)); // "9" (e.g. 11-2)
   */
  export function seek(
    rid: number,
    offset: number,
    whence: SeekMode
  ): Promise<number>;

  /** 使用给定的资源 ID (rid) 来关闭先前创建或打开的文件。
   * 为避免资源泄露，事关重大，文件应当用完即关。
   *
   *      const file = await Deno.open("my_file.txt");
   *      // 与 "file" 对象一起使用
   *      Deno.close(file.rid);
   */
  export function close(rid: number): void;

  /** 用于读取和写入文件的 Deno 抽象类。 */
  export class File
    implements
      Reader,
      SyncReader,
      Writer,
      SyncWriter,
      Seeker,
      SyncSeeker,
      Closer {
    readonly rid: number;
    constructor(rid: number);
    write(p: Uint8Array): Promise<number>;
    writeSync(p: Uint8Array): number;
    read(p: Uint8Array): Promise<number | EOF>;
    readSync(p: Uint8Array): number | EOF;
    seek(offset: number, whence: SeekMode): Promise<number>;
    seekSync(offset: number, whence: SeekMode): number;
    close(): void;
  }

  /** 用于 `stdin` 的 `Deno.File` 实例。 */
  export const stdin: File;
  /** 用于 `stdout` 的 `Deno.File` 实例。 */
  export const stdout: File;
  /** 用于 `stderr` 的 `Deno.File` 实例。 */
  export const stderr: File;

  export interface OpenOptions {
    /** 设置读取访问权限的选项。
     * 当为 `true` 时，表示该文件在打开后即处于可读状态。 */
    read?: boolean;
    /** 设置写访问权限的选项。
     * 当为 `true` 时，表示该文件在打开时即处于可写状态。
     * 如果该文件已存在，则默认情况下，对该文件的任何写调用都将覆盖其内容，而不会截断该文件。 */
    write?: boolean;
    /** 设置追加模式的选项。
     * 当为 `true` 时，表示写入将追加到文件中，而不是覆盖先前的内容。
     * 请注意，设置 `{ write: true, append: true }` 与仅设置 `{ append: true }` 具有相同的效果。 */
    append?: boolean;
    /** 设置截断上一个文件的选项。
     * 如果使用此选项后成功打开了文件，则文件的长度将被截断为 `0`（如果已存在）。
     * 该文件必须具有写访问权限才能打开，才能进行截断。 */
    truncate?: boolean;
    /** 设置选项以允许创建新文件（如果指定路径尚不存在）。
     * 需要使用写权限或追加权限。*/
    create?: boolean;
    /** 默认为 `false`。
     * 如果设置为 `true`，则在目标位置不允许存在文件、目录或符号链接。
     * 需要使用写权限或追加权限。
     * 当 createNew 设置为 `true` 时，create 和 truncate 被忽略。 */
    createNew?: boolean;
    /** 创建文件时使用的权限（在进程调用 `umask` 之前默认为 `0o666`）。
     * 在 Windows 上此选项被忽略。 */
    mode?: number;
  }

  /** 一组字符串文本，用于指定如何打开文件。
   *
   * |值    |描述                                                                                               |
   * |------|--------------------------------------------------------------------------------------------------|
   * |`"r"` |只读。默认值。从文件开头开始。                                                                         |
   * |`"r+"`|可读写。从文件开头开始。                                                                              |
   * |`"w"` |仅写入。打开并截取现有文件或者创建一个仅写入权限的新文件。                                                  |
   * |`"w+"`|可读写。打开并截取现有文件或者创建一个可读写权限的新文件。                                                  |
   * |`"a"` |仅写入。打开现有文件或者创建新文件。每次写入都会将内容追加到文件末尾。                                        |
   * |`"a+"`|可读写。行为类似于 `"a"` 并且允许从文件中读取。                                                          |
   * |`"x"` |仅写入。专属创建 - 仅在文件不存在时创建新文件。                                                           |
   * |`"x+"`|可读写。行为类似于 `"x"` 并且允许从文件中读取。                                                         |
   */
  export type OpenMode = "r" | "r+" | "w" | "w+" | "a" | "a+" | "x" | "x+";

  /** **不稳定**: 新 API，没有经过审查。
   *
   *  检查指定的资源 id (`rid`) 是否为 TTY（终端）。
   *
   *       // 这个例子依赖于特定的操作系统和环境
   *       const nonTTYRid = Deno.openSync("my_file.txt").rid;
   *       const ttyRid = Deno.openSync("/dev/tty6").rid;
   *       console.log(Deno.isatty(nonTTYRid)); // false
   *       console.log(Deno.isatty(ttyRid)); // true
   *       Deno.close(nonTTYRid);
   *       Deno.close(ttyRid);
   */
  export function isatty(rid: number): boolean;

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 设置终端是否为 raw 模式。
   * 在 raw 模式下，无需处理即可直接读取和返回字符。
   * 终端将禁止所有特殊的字符处理，包括回显输入字符。
   * 在 raw 模式下从终端设备读取的速度比在标准模式下更快。
   *
   *       Deno.setRaw(myTTY.rid, true);
   */
  export function setRaw(rid: number, mode: boolean): void;

  /** 一个具有 `read()` 和 `write()` 方法大小可变的字节缓冲区。
   *
   * 基于 [Go Buffer](https://golang.org/pkg/bytes/#Buffer)。 */
  export class Buffer implements Reader, SyncReader, Writer, SyncWriter {
    constructor(ab?: ArrayBuffer);
    /** 返回一个缓冲区未读部分的片段。
     *
     * 该片段只在下一次缓冲区修改之前有效 (即, 只有在下一次调用像 `read()`, `write()`,
     * `reset()`, 或者 `truncate()` 这样的方法)。
     * 该片段会在下一次修改缓冲区内容之前将缓冲区内容进行别名处理 ,  所以立刻改变片段会影响未来读取的结果。 */
    bytes(): Uint8Array;
    /** 将缓冲区中未读部分的内容以 `string` 的形式返回。
     *
     * **警告**: 当数据流经缓冲区时存在多个字节, 这种方法可能会因为字符被拆分而导致字符串的结果错误。 */
    toString(): string;
    /** 返回缓冲区的未读部分是否为空。 */
    empty(): boolean;
    /** 只读缓冲区未读部分的字节数。 */
    readonly length: number;
    /** 缓冲区底层字节片段的只读容量，即为缓冲区数据分配的总空间。 */
    readonly capacity: number;
    /** 除了缓冲器中开头 `n` 个未读字节之外，其他的所有字节都丢弃，但是继续使用相同分配的存储空间。
     * 当 `n` 为负数或者大于缓冲区的长度, 则会抛出异常。 */
    truncate(n: number): void;
    /** 将缓冲区重置为空，但它保留了底层存储供未来写入时使用，`.reset()` 与 `.truncate(0)` 相同。 */
    reset(): void;
    /** 在缓冲区中读取下一个 `p.length` 字节，或直到缓冲区用完为止。
     * 返回只读的字节数。当缓冲区没有数据返回，则返回值为 `Deno.EOF`。 */
    readSync(p: Uint8Array): number | EOF;
    /** 在缓冲区中读取下一个 `p.length` 字节，或直到缓冲区用完为止。
     * 解析读取的字节数。当缓冲区没有数据返回，则解析为 `Deno.EOF`。 */
    read(p: Uint8Array): Promise<number | EOF>;
    writeSync(p: Uint8Array): number;
    write(p: Uint8Array): Promise<number>;
    /** 增加缓冲区的容量，必要时保证另一个 `n` 字节的空间。
     * 在 `.grow(n)` 之后，至少可以将 `n` 个字节写到缓冲区中而不需要另外分配。
     * 若 `n` 为负数，`.grow()` 将抛出异常。
     * 当缓冲区不能增加的时候会抛出错误。
     * 基于 Go Lang 的
     * [Buffer.Grow](https://golang.org/pkg/bytes/#Buffer.Grow). */
    grow(n: number): void;
    /** 从 `r` 读取数据直到 `Deno.EOF`，并将其附加到缓冲区，根据需要扩展缓冲区。
     * 解析读取的字节数。 如果缓冲区过大，`.readFrom()` 将会 reject 一个错误。
     * 基于 Go Lang 的
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */
    readFrom(r: Reader): Promise<number>;
    /** 从 `r` 读取数据直到 `Deno.EOF`，并将其附加到缓冲区，根据需要扩展缓冲区。
     * 返回读取的字节数，如果缓冲区过大，`.readFromSync()` 将会抛出错误。
     * 基于 Go Lang 的
     * [Buffer.ReadFrom](https://golang.org/pkg/bytes/#Buffer.ReadFrom). */
    readFromSync(r: SyncReader): number;
  }

  /** 读取 Reader `r` 直到文件的末尾 (`Deno.EOF`)，返回文件的内容，以 `Uint8Array` 表示。
   *
   *       // Example：从 stdin 读取
   *       const stdinContent = await Deno.readAll(Deno.stdin);
   *
   *       // Example：从文件读取
   *       const file = await Deno.open("my_file.txt", {read: true});
   *       const myFileContent = await Deno.readAll(file);
   *       Deno.close(file.rid);
   *
   *       // Example：从 buffer 读取
   *       const myData = new Uint8Array(100);
   *       // ... 此处省略了填充 myData 数组的代码
   *       const reader = new Deno.Buffer(myData.buffer as ArrayBuffer);
   *       const bufferContent = await Deno.readAll(reader);
   */
  export function readAll(r: Reader): Promise<Uint8Array>;

  /** 同步地读取 Reader `r` 直到文件的末尾 (`Deno.EOF`)，返回文件的内容，以 `Uint8Array` 表示。
   *
   *       // Example：从 stdin 读取
   *       const stdinContent = Deno.readAllSync(Deno.stdin);
   *
   *       // Example：从文件读取
   *       const file = Deno.openSync("my_file.txt", {read: true});
   *       const myFileContent = Deno.readAllSync(file);
   *       Deno.close(file.rid);
   *
   *       // Example：从 buffer 读取
   *       const myData = new Uint8Array(100);
   *       // ... 此处省略了填充 myData 数组的代码
   *       const reader = new Deno.Buffer(myData.buffer as ArrayBuffer);
   *       const bufferContent = Deno.readAllSync(reader);
   */
  export function readAllSync(r: SyncReader): Uint8Array;

  /** 将所有 Array Buffer （`arr`）中的的内容写入到对象 （`w`） 中
   *
   *       // 举例：写入到 stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       await Deno.writeAll(Deno.stdout, contentBytes);
   *
   *       // 举例：写入到文件
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = await Deno.open('test.file', {write: true});
   *       await Deno.writeAll(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       // 举例：写入到 Buffer 对象
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const writer = new Deno.Buffer();
   *       await Deno.writeAll(writer, contentBytes);
   *       console.log(writer.bytes().length);  // 11
   */
  export function writeAll(w: Writer, arr: Uint8Array): Promise<void>;

  /** 将所有 Array Buffer （`arr`）中的的内容同步写入到对象 （`w`） 中
   *
   *       // 举例：写入到 stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       Deno.writeAllSync(Deno.stdout, contentBytes);
   *
   *       // 举例：写入到文件
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = Deno.openSync('test.file', {write: true});
   *       Deno.writeAllSync(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       // 举例：写入到 Buffer 对象
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const writer = new Deno.Buffer();
   *       Deno.writeAllSync(writer, contentBytes);
   *       console.log(writer.bytes().length);  // 11
   */
  export function writeAllSync(w: SyncWriter, arr: Uint8Array): void;

  export interface MkdirOptions {
    /** 默认为 `false`。
     * 如果设置为 `true`，则意味着还将创建所有中间目录（如 shell 命令 `mkdir -p` 那样）。
     * 使用相同的权限创建中间目录。
     * 当设置为 `true` 时，如果路径中已经存在目录，或者该路径是到现有目录的符号链接，则会静默地操作成功（不更改任何权限）。*/
    recursive?: boolean;
    /** 创建目录时使用的权限（在调用 `umask` 之前，默认值为 `0o777`）。在 Windows 上被忽略。*/
    mode?: number;
  }

  /** 同步地在指定路径下创建一个新的目录。
   *
   *       Deno.mkdirSync("new_dir");
   *       Deno.mkdirSync("nested/directories", { recursive: true });
   *       Deno.mkdirSync("restricted_access_dir", { mode: 0o700 });
   *
   * 目录存在的情况下，默认抛出错误。
   *
   * 需要 `allow-write` 权限。 */
  export function mkdirSync(path: string, options?: MkdirOptions): void;

  /** 在指定路径下创建一个新的目录。
   *
   *       await Deno.mkdir("new_dir");
   *       await Deno.mkdir("nested/directories", { recursive: true });
   *       await Deno.mkdir("restricted_access_dir", { mode: 0o700 });
   *
   * 目录存在的情况下，默认抛出错误。
   *
   * 需要 `allow-write` 权限。 */
  export function mkdir(path: string, options?: MkdirOptions): Promise<void>;

  export interface MakeTempOptions {
    /** 指定在哪里创建临时文件夹（默认为环境变量 TMPDIR 或者是系统默认目录，ps：通常是 /tmp）。 */
    dir?: string;
    /** 临时文件夹名前缀 */
    prefix?: string;
    /** 临时文件夹名后缀 */
    suffix?: string;
  }

  /** 以同步的方式在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件夹,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件夹名添加前缀的 `prefix` 和给文件夹名添加后缀的 `sufix`。
   *
   * 返回新建文件夹的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件夹。当不再需要该临时文件夹时，调用者应该主动删除该文件夹。
   *
   *       const tempDirName0 = Deno.makeTempDirSync();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = Deno.makeTempDirSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp339c944d
   *
   * 需要 `allow-write` 权限。 */
  // TODO(ry) 不校验权限。
  export function makeTempDirSync(options?: MakeTempOptions): string;

  /** 在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件夹,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件夹名添加前缀的 `prefix` 和给文件夹名添加后缀的 `sufix`。
   *
   * 返回新建文件夹的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件夹。当不再需要该临时文件夹时，调用者应该主动删除该文件夹。
   *
   *       const tempDirName0 = await Deno.makeTempDir();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = await Deno.makeTempDir({ prefix: 'my_temp' }); // e.g. /tmp/my_temp339c944d
   *
   * 需要 `allow-write` 权限。 */
  // TODO(ry) 不校验权限。
  export function makeTempDir(options?: MakeTempOptions): Promise<string>;

  /** 以同步的方式在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件名添加前缀的 `prefix` 和给文件名添加后缀的 `sufix`。
   *
   * 返回新建文件的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tempFileName0 = Deno.makeTempFileSync(); // e.g. /tmp/419e0bf2
   *       const tempFileName1 = Deno.makeTempFileSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp754d3098
   *
   * 需要 `allow-write` 权限. */
  export function makeTempFileSync(options?: MakeTempOptions): string;

  /** 在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 其他可选的参数包括分别给文件名添加前缀的 `prefix` 和给文件名添加后缀的 `sufix`。
   *
   * 返回新建文件的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tmpFileName0 = await Deno.makeTempFile();  // e.g. /tmp/419e0bf2
   *       const tmpFileName1 = await Deno.makeTempFile({ prefix: 'my_temp' });  // e.g. /tmp/my_temp754d3098
   *
   * 需要 `allow-write` 权限. */
  export function makeTempFile(options?: MakeTempOptions): Promise<string>;

  /** 同步地更改指定路径下特定的文件/目录的权限。
   * 忽略进程的 umask。
   *
   *       Deno.chmodSync("/path/to/file", 0o666);
   *
   * 相关完整说明，参考 [chmod](#chmod)
   *
   * 注意：该 API 当前在 Windows 上使用会抛出异常
   *
   * 需要 `allow-write` 权限。 */
  export function chmodSync(path: string, mode: number): void;

  /** 更改指定路径下特定的文件/目录的权限。
   * 忽略进程的 umask。
   *
   *       await Deno.chmod("/path/to/file", 0o666);
   *
   * 该模式是3个八进制数字的序列。
   * 第一个/最左边的数字指定所有者（owner）的权限。
   * 第二个数字指定组（group）的权限。
   * 最后/最右边的数字指定其他用户的权限。
   * 例如，在 0o764 模式下，所有者（owner）有读/写/执行权限（7），组（group）有读/写权限（6），
   * 其他用户（4）只有读的权限。
   *
   * |   值   |     说明     |
   * | ------ | ----------- |
   * | 7      | read, write, and execute |
   * | 6      | read and write |
   * | 5      | read and execute |
   * | 4      | read only |
   * | 3      | write and execute |
   * | 2      | write only |
   * | 1      | execute only |
   * | 0      | no permission |
   *
   * 注意：该 API 当前在 Windows 上使用会抛出异常
   *
   * 需要 `allow-write` 权限。 */
  export function chmod(path: string, mode: number): Promise<void>;

  /** 同步地更改常规文件或目录的所有者。该功能在 Windows 上不可用。
   *
   *      Deno.chownSync("myFile.txt", 1000, 1002);
   *
   * 需要 `allow-write` 权限。
   *
   * 如果在 Windows 上执行，将抛出错误（未实现）
   *
   * @param path path to the file
   * @param uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   */
  export function chownSync(path: string, uid: number, gid: number): void;

  /** 更改常规文件或目录的所有者。该功能在 Windows 上不可用。
   *
   *      await Deno.chown("myFile.txt", 1000, 1002);
   *
   * 需要 `allow-write` 权限。
   *
   * 如果在 Windows 上执行，将抛出错误（未实现）
   *
   * @param path path to the file
   * @param uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   */
  export function chown(path: string, uid: number, gid: number): Promise<void>;

  /** **不稳定**：需要对高精度时间（hrtime）进行调查。
   *
   * 同步地更改路径（`path`）引用的文件系统对象的访问时间（`atime`）和修改时间（`mtime`）。
   * 给定的时间参数可以是秒（UNIX 纪元时间）或者日期对象。
   *
   *       Deno.utimeSync("myfile.txt", 1556495550, new Date());
   *
   * 需要 `allow-write` 权限。 */
  export function utimeSync(
    path: string,
    atime: number | Date,
    mtime: number | Date
  ): void;

  /** **UNSTABLE**: 需要调研高精度的 time。
   *
   * 基于文件系统的 `path` 改变访问 (`atime`) 和修改 (`mtime`) 的时间。
   * 给定的时间以秒 （UNIX epoch time） 为单位或着是 `Date` 对象。
   *
   *       await Deno.utime("myfile.txt", 1556495550, new Date());
   *
   * 需要 `allow-write` 权限。 */
  export function utime(
    path: string,
    atime: number | Date,
    mtime: number | Date
  ): Promise<void>;

  export interface RemoveOptions {
    /** 默认为 `false`。如果设置为 `true`，则即使路径为非空目录也会被删除。 */
    recursive?: boolean;
  }

  /** 同步删除指定的文件或目录。
   *
   *       Deno.removeSync("/path/to/empty_dir/or/file");
   *       Deno.removeSync("/path/to/populated_dir/or/file", { recursive: true });
   *
   * 当权限被拒绝、路径找不到或者为非空目录且 `recursive` 未设置为 `true`，则抛出异常。
   *
   * 需要 `allow-write` 权限 */
  export function removeSync(path: string, options?: RemoveOptions): void;

  /** 删除指定的文件或目录。
   *
   *       await Deno.remove("/path/to/empty_dir/or/file");
   *       await Deno.remove("/path/to/populated_dir/or/file", { recursive: true });
   *
   * 当权限被拒绝、路径找不到或者为非空目录且 `recursive` 未设置为 `true`，则抛出异常。
   *
   * 需要 `allow-write` 权限 */
  export function remove(path: string, options?: RemoveOptions): Promise<void>;

  /** 同步方式将 `oldpath` 重命名（或移动）为 `newpath`。路径可以是文件或目录。
   * 如果 `newpath` 已经存在且不是目录，那么 `rename()` 将替换它。
   * 当 `oldpath` 和 `newpath` 位于不同的目录中时，可能会受到操作系统的限制。
   *
   *       Deno.renameSync("old/path", "new/path");
   *
   * 在 Unix 系统上，此操作不会修改符号链接所指向的内容。
   *
   * 当操作引发错误时，平台之间会有所不同。
   * 如果 `newpath` 是非空目录则始终会报错。
   *
   * 需要 `allow-read` 和 `allow-write` 权限。 */
  export function renameSync(oldpath: string, newpath: string): void;

  /** 将 `oldpath` 重命名（或移动）为 `newpath`。路径可以是文件或目录。
   * 如果 `newpath` 已经存在且不是目录，那么 `rename()` 将替换它。
   * 当 `oldpath` 和 `newpath` 位于不同的目录中时，可能会受到操作系统的限制。
   *
   *       await Deno.rename("old/path", "new/path");
   *
   * 在 Unix 系统上，此操作不会修改符号链接所指向的内容。
   *
   * 当操作引发错误时，平台之间会有所不同。
   * 如果 `newpath` 是非空目录则始终会报错。
   *
   * 需要 `allow-read` 和 `allow-write` 权限。 */
  export function rename(oldpath: string, newpath: string): Promise<void>;

  /** 同步地读取并将文件的全部内容解析为字节数组。
   * `TextDecoder` 可以在需要的情况下可以将字节转换成字符串。
   * 读取目录返回一个空的数据数组。
   *
   *       const decoder = new TextDecoder("utf-8");
   *       const data = Deno.readFileSync("hello.txt");
   *       console.log(decoder.decode(data));
   *
   * 需要 `allow-read` 权限。 */
  export function readFileSync(path: string): Uint8Array;

  /** 读取并将文件的全部内容解析为字节数组。
   * `TextDecoder` 可以在需要的情况下可以将字节转换成字符串。
   * 读取目录返回一个空的数据数组。
   *
   *       const decoder = new TextDecoder("utf-8");
   *       const data = await Deno.readFile("hello.txt");
   *       console.log(decoder.decode(data));
   *
   * 需要 `allow-read` 权限。 */
  export function readFile(path: string): Promise<Uint8Array>;

  /** FileInfo 用于描述 `stat`, `lstat`,
   * `statSync`, `lstatSync` 函数返回的文件信息。而 `readdir`,
   * `readdirSync` 返回的信息则用 FileInfo 列表来描述。 */
  export interface FileInfo {
    /** 文件的大小，单位 byte。 */
    size: number;
    /** 文件最后修改时间。
     * 在 Linux/Mac 系统这个值是 `mtime`，在 Windows 系统这个值是 `ftLastWriteTime`。
     * 在某些系统中这个属性可能不存在。 */
    modified: number | null;
    /** 文件最后访问时间。
     * 在 Linux/Mac 系统这个值是 `atime`，在 Windows 系统这个值是 `ftLastAccessTime`。
     * 在某些系统中这个属性可能不存在。 */
    accessed: number | null;
    /** 文件的创建时间。
     * 在 Linux/Mac 系统这个值是 `birthtime`，在 Windows 系统这个值是 `ftCreationTime`。
     * 在某些系统中这个属性可能不存在。*/
    created: number | null;
    /** 文件名或目录名。 */
    name: string | null;
    /** 包含此文件的设备的 ID。
     *
     * _只在 Linux/Mac OS 有效。_ */
    dev: number | null;
    /** Inode 值。
     *
     * _只在 Linux/Mac OS 有效。_ */
    ino: number | null;
    /** **不稳定**: 将此属性的行为与 Windows 上的 Go 相匹配。
     *
     * 该文件或目录的权限位，返回标准的 Unix 底层 `st_mode` 位。 */
    mode: number | null;
    /** 文件的硬链接数。
     *
     * _只在 Linux/Mac OS 有效。_ */
    nlink: number | null;
    /** 拥有该文件的用户的 uid。
     *
     * _只在 Linux/Mac OS 有效。_ */
    uid: number | null;
    /** 拥有该文件的用户组的 gid。
     *
     * _只在 Linux/Mac OS 有效。_ */
    gid: number | null;
    /** 文件设备标识符 ID。
     *
     * _只在 Linux/Mac OS 有效。_ */
    rdev: number | null;
    /** 用于 I/O 操作的文件系统块的大小。
     *
     * _只在 Linux/Mac OS 有效。_ */
    blksize: number | null;
    /** 为此文件分配的块数，此值是一个 512 字节单位。
     *
     * _只在 Linux/Mac OS 有效。_ */
    blocks: number | null;
    /** 判断文件是否为一个常规文件。该结果与 `FileInfo.isDirectory` 和 `FileInfo.isSymlink` 互斥。 */
    isFile(): boolean;
    /** 判断文件是否为一个常规目录。该结果与 `FileInfo.isFile` 和 `FileInfo.isSymlink` 互斥。 */
    isDirectory(): boolean;
    /** 判断文件是否为一个符号链接。该结果与 `FileInfo.isDirectory` 和 `FileInfo.isDirectory` 互斥。 */
    isSymlink(): boolean;
  }

  /** 返回被解析后的符号链接绝对路径。
   *
   *       // 例如: 给定文件 /home/alice/file.txt 和当前目录 /home/alice
   *       Deno.symlinkSync("file.txt", "symlink_file.txt");
   *       const realPath = Deno.realpathSync("./file.txt");
   *       const realSymLinkPath = Deno.realpathSync("./symlink_file.txt");
   *       console.log(realPath);  // 输出 "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  // 输出 "/home/alice/file.txt"
   *
   * 需要 `allow-read` 权限 */
  export function realpathSync(path: string): string;

  /** 返回被解析后的符号链接绝对路径。
   *
   *       // 例如: 给定文件 /home/alice/file.txt 和当前目录 /home/alice
   *       await Deno.symlink("file.txt", "symlink_file.txt");
   *       const realPath = await Deno.realpath("./file.txt");
   *       const realSymLinkPath = await Deno.realpath("./symlink_file.txt");
   *       console.log(realPath);  // 输出 "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  // 输出 "/home/alice/file.txt"
   *
   * 需要 `allow-read` 权限 */
  export function realpath(path: string): Promise<string>;

  /** 不稳定：此 API 可能会更改为返回一个可迭代对象
   *
   * 同步读取 `path` 文件目录，并返回 `Deno.FileInfo` 数组。
   *
   *       const files = Deno.readdirSync("/");
   *
   * 如果 `path` 不是目录则抛出错误。
   *
   * 需要 `allow-read` 权限 */
  export function readdirSync(path: string): FileInfo[];

  /** 不稳定：此 API 返回值可能更改为 `AsyncIterable`。
   *
   * 读取 `path` 文件目录，并返回 `Deno.FileInfo` 数组。
   *
   *       const files = await Deno.readdir("/");
   *
   * 如果 `path` 不是目录则抛出错误。
   *
   * 需要 `allow-read` 权限 */
  export function readdir(path: string): Promise<FileInfo[]>;

  /** 采用同步方式将一个文件的内容和权限复制到另一个指定的路径，默认情况下根据需要
   * 创建新文件或者覆盖原文件。 如果目标路径是目录或不可写，则失败。
   *
   *       Deno.copyFileSync("from.txt", "to.txt");
   *
   * Requires `allow-read` permission on fromPath.
   * Requires `allow-write` permission on toPath. */
  export function copyFileSync(fromPath: string, toPath: string): void;

  /** 将一个文件的内容和权限复制到另一个指定的路径，默认情况下根据需要
   * 创建新文件或者覆盖原文件。 如果目标路径是目录或不可写，则失败。
   *
   *       await Deno.copyFile("from.txt", "to.txt");
   *
   * `fromPath` 需要 `allow-read` 权限。
   * `toPath` 需要 `allow-write` 权限。 */
  export function copyFile(fromPath: string, toPath: string): Promise<void>;

  /** 同步方式解析并返回符号链接对目标文件的绝对路径。
   *
   *       Deno.symlinkSync("./test.txt", "./test_link.txt");
   *       const target = Deno.readlinkSync("./test_link.txt"); // ./test.txt 的绝对路径
   *
   * 如果使用硬链接调用，则会抛出 `TypeError`。
   *
   * 需要 `allow-read` 权限 */
  export function readlinkSync(path: string): string;

  /** 解析并返回符号链接对目标文件的绝对路径。
   *
   *       await Deno.symlink("./test.txt", "./test_link.txt");
   *       const target = await Deno.readlink("./test_link.txt"); // ./test.txt 的绝对路径
   *
   * 如果使用硬链接调用，则会抛出 `TypeError`。
   *
   * 需要 `allow-read` 权限 */
  export function readlink(path: string): Promise<string>;

  /** 解析给定的 `path`，并返回 `Deno.FileInfo`。如果 `path` 是一个
   * 符号链接，则将返回符号链接的信息，而不是该符号链接引用的文件信息。
   *
   *       const fileInfo = await Deno.lstat("hello.txt");
   *       assert(fileInfo.isFile());
   *
   * 需要 `allow-read` 权限 */
  export function lstat(path: string): Promise<FileInfo>;

  /** 同步方式解析给定的 `path`，并返回 `Deno.FileInfo`。如果 `path` 是一个
   * 符号链接，则将返回符号链接的信息，而不是该符号链接引用的文件信息。
   *
   *       const fileInfo = Deno.lstatSync("hello.txt");
   *       assert(fileInfo.isFile());
   *
   * 需要 `allow-read` 权限 */
  export function lstatSync(path: string): FileInfo;

  /** 解析给定 `path`，返回 `Deno.FileInfo`。如果 `path` 为符号链接，则返回符号链接指向的文件。
   *
   *       const fileInfo = await Deno.stat("hello.txt");
   *       assert(fileInfo.isFile());
   *
   * 需要 `allow-read` 权限 */
  export function stat(path: string): Promise<FileInfo>;

  /** 同步方式解析给定 `path`，返回 `Deno.FileInfo`。
   * 如果 `path` 为符号链接，则返回符号链接指向的文件。
   *
   *       const fileInfo = Deno.statSync("hello.txt");
   *       assert(fileInfo.isFile());
   *
   * 需要 `allow-read` 权限 */
  export function statSync(path: string): FileInfo;

  /** 同步方式创建 `newpath` 作为 `oldpath` 的硬链接。
   *
   *       Deno.linkSync("old/name", "new/name");
   *
   * 需要 `allow-read` 和 `allow-write` 权限 */
  export function linkSync(oldpath: string, newpath: string): void;

  /** 创建 `newpath` 作为 `oldpath` 的硬链接。
   *
   *       await Deno.link("old/name", "new/name");
   *
   * 需要 `allow-read` 和 `allow-write` 权限 */
  export function link(oldpath: string, newpath: string): Promise<void>;

  /** **不稳定**：`type` 参数可能更改为 `"dir" | "file"` 的联合类型。
   *
   * 同步方式创建 `newpath` 作为指向 `oldpath` 的符号链接。
   *
   * `type` 参数可以设置为 `dir` 或 `file`。此参数仅在 Windows 上可用，其他平台会被忽略。
   *
   * 注意：此函数尚未在 Windows 上实现。
   *
   *       Deno.symlinkSync("old/name", "new/name");
   *
   * 需要 `allow-read` 和 `allow-write` 权限 */
  export function symlinkSync(
    oldpath: string,
    newpath: string,
    type?: string
  ): void;

  /** **不稳定**：`type` 参数可能更改为 `"dir" | "file"` 的联合类型。
   *
   * 创建 `newpath` 作为指向 `oldpath` 的符号链接。
   *
   * `type` 参数可以设置为 `dir` 或 `file`。此参数仅在 Windows 上可用，其他平台会被忽略。
   *
   * 注意：此函数尚未在 Windows 上实现。
   *
   *       await Deno.symlink("old/name", "new/name");
   *
   * 需要 `allow-read` 和 `allow-write` 权限 */
  export function symlink(
    oldpath: string,
    newpath: string,
    type?: string
  ): Promise<void>;

  /** `Deno.writeFileSync` 和 `Deno.writeFile` 的选项。*/
  export interface WriteFileOptions {
    /** 默认为 `false`。如果设置为 `true`，
     * 则将追加到文件中，而不是覆盖之前的内容。 */
    append?: boolean;
    /** 默认为 `true`。如果指定路径不存在
     * 文件，是否允许创建新文件的选项。*/
    create?: boolean;
    /** 文件的权限。*/
    mode?: number;
  }

  /** 同步方式将 `data` 写入给定的 `path`，并且根据需要创建新文件或者覆盖原文件。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world\n");
   *       Deno.writeFileSync("hello1.txt", data);  // 覆盖或者创建 "hello1.txt"
   *       Deno.writeFileSync("hello2.txt", data, {create: false});  // 仅当 "hello2.txt" 存在的情况下才有效
   *       Deno.writeFileSync("hello3.txt", data, {mode: 0o777});  // 设置新文件的权限
   *       Deno.writeFileSync("hello4.txt", data, {append: true});  // 在文件末尾添加数据
   *
   * 需要 `allow-write` 权限。如果 `options.create` 为 `false` 且需要 `allow-read` 权限。
   */
  export function writeFileSync(
    path: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ): void;

  /** 将 `data` 写入给定的 `path`，并且根据需要创建新文件或者覆盖原文件。
   *
   *       const encoder = new TextEncoder();
   *       const data = encoder.encode("Hello world\n");
   *       await Deno.writeFile("hello1.txt", data);  // 覆盖或者创建 "hello1.txt"
   *       await Deno.writeFile("hello2.txt", data, {create: false});  // 仅当 "hello2.txt" 存在的情况下才有效
   *       await Deno.writeFile("hello3.txt", data, {mode: 0o777});  // 设置新文件的权限
   *       await Deno.writeFile("hello4.txt", data, {append: true});  // 在文件末尾添加数据
   *
   * 需要 `allow-write` 权限。如果 `options.create` 为 `false` 且需要 `allow-read` 权限。
   */
  export function writeFile(
    path: string,
    data: Uint8Array,
    options?: WriteFileOptions
  ): Promise<void>;

  /** **不稳定**: 不应该和 `window.location` 具有相同的类型名. */
  interface Location {
    /** 模块的完整 url，例如：`file://some/file.ts` 抑或是 `https://some/file.ts`。*/
    filename: string;
    /** 在文件中的行号，从 1 开始索引。*/
    line: number;
    /** 在文件中的列号，从 1 开始索引。*/
    column: number;
  }

  /** 不稳定: 新 API，尚待审查。
   *
   * 给定模块中的当前位置，返回查找到的源文件中位置。
   *
   * 当 Deno 编译代码时，它将保留已编译代码的 source maps。
   * 此功能可用于查找原始位置。
   * 当访问 error 的 `.stack` 属性或出现未捕获的错误时，会自动执行此操作。
   * 此功能可用于查找源文件以创建更好的错误处理。
   *
   * **注意:** `line` 和 `column` 的下标从 1 开始，与代码的显示值匹配，但这种以 1 开始的索引方式并不代表 Deno 中大多数文件都是如此。
   *
   * 示例:
   *
   *       const orig = Deno.applySourceMap({
   *         location: "file://my/module.ts",
   *         line: 5,
   *         column: 15
   *       });
   *       console.log(`${orig.filename}:${orig.line}:${orig.column}`);
   */
  export function applySourceMap(location: Location): Location;

  /** 一些 Error 构造函数的集合，当 Deno API 抛出错误时会用到这些异常。 */
  export const errors: {
    NotFound: ErrorConstructor;
    PermissionDenied: ErrorConstructor;
    ConnectionRefused: ErrorConstructor;
    ConnectionReset: ErrorConstructor;
    ConnectionAborted: ErrorConstructor;
    NotConnected: ErrorConstructor;
    AddrInUse: ErrorConstructor;
    AddrNotAvailable: ErrorConstructor;
    BrokenPipe: ErrorConstructor;
    AlreadyExists: ErrorConstructor;
    InvalidData: ErrorConstructor;
    TimedOut: ErrorConstructor;
    Interrupted: ErrorConstructor;
    WriteZero: ErrorConstructor;
    UnexpectedEof: ErrorConstructor;
    BadResource: ErrorConstructor;
    Http: ErrorConstructor;
  };

  /** **不稳定**：希望与浏览器在名称上有更多的相同。
   *
   * 调用方授予的权限。
   *
   * 具体查看：https://w3c.github.io/permissions/#permission-registry */
  export type PermissionName =
    | "run"
    | "read"
    | "write"
    | "net"
    | "env"
    | "plugin"
    | "hrtime";

  /** 权限的状态。
   *
   * 具体查看：https://w3c.github.io/permissions/#status-of-a-permission */
  export type PermissionState = "granted" | "denied" | "prompt";

  interface RunPermissionDescriptor {
    name: "run";
  }

  interface ReadWritePermissionDescriptor {
    name: "read" | "write";
    path?: string;
  }

  interface NetPermissionDescriptor {
    name: "net";
    url?: string;
  }

  interface EnvPermissionDescriptor {
    name: "env";
  }

  interface PluginPermissionDescriptor {
    name: "plugin";
  }

  interface HrtimePermissionDescriptor {
    name: "hrtime";
  }

  /** 权限描述符，定义一个可以查询、请求或撤销的权限。
   *
   * 具体查看：https://w3c.github.io/permissions/#permission-descriptor */
  type PermissionDescriptor =
    | RunPermissionDescriptor
    | ReadWritePermissionDescriptor
    | NetPermissionDescriptor
    | EnvPermissionDescriptor
    | PluginPermissionDescriptor
    | HrtimePermissionDescriptor;

  export class Permissions {
    /** 查询给定权限的状态。
     *
     *       const status = await Deno.permissions.query({ name: "read", path: "/etc" });
     *       if (status.state === "granted") {
     *         data = await Deno.readFile("/etc/passwd");
     *       }
     */
    query(desc: PermissionDescriptor): Promise<PermissionStatus>;

    /** 撤销给定的权限，并且返回该权限的状态。
     *
     *       const status = await Deno.permissions.revoke({ name: "run" });
     *       console.assert(status.state !== "granted")
     */
    revoke(desc: PermissionDescriptor): Promise<PermissionStatus>;

    /** 请求权限，并且返回该权限请求结果的状态。
     *
     *       const status = await Deno.permissions.request({ name: "env" });
     *       if (status.state === "granted") {
     *         console.log(Deno.homeDir());
     *       } else {
     *         console.log("'env' permission is denied.");
     *       }
     */
    request(desc: PermissionDescriptor): Promise<PermissionStatus>;
  }

  /** **不稳定**：可能移动到 `navigator.permissions` 以匹配 web API。 */
  export const permissions: Permissions;

  /** 具体查看：https://w3c.github.io/permissions/#permissionstatus */
  export class PermissionStatus {
    state: PermissionState;
    constructor(state: PermissionState);
  }

  /** 同步地通过指定的 `len` ，截取或者扩展指定的文件内容。如果未指定 `len` ，则整个文件内容将被截取。
   *
   *       // truncate the entire file
   *       Deno.truncateSync("my_file.txt");
   *
   *       // truncate part of the file
   *       const file = Deno.makeTempFileSync();
   *       Deno.writeFileSync(file, new TextEncoder().encode("Hello World"));
   *       Deno.truncateSync(file, 7);
   *       const data = Deno.readFileSync(file);
   *       console.log(new TextDecoder().decode(data));
   *
   * 需要 `allow-write` 权限。 */

  export function truncateSync(name: string, len?: number): void;

  /** 通过指定的 `len` ，截取或者扩展指定的文件内容。如果未指定 `len` ，则整个文件内容将被截取。
   *
   *       // truncate the entire file
   *       await Deno.truncate("my_file.txt");
   *
   *       // truncate part of the file
   *       const file = await Deno.makeTempFile();
   *       await Deno.writeFile(file, new TextEncoder().encode("Hello World"));
   *       await Deno.truncate(file, 7);
   *       const data = await Deno.readFile(file);
   *       console.log(new TextDecoder().decode(data));  // "Hello W"
   *
   * 需要 `allow-write` 权限。 */

  export function truncate(name: string, len?: number): Promise<void>;

  export interface AsyncHandler {
    (msg: Uint8Array): void;
  }

  export interface PluginOp {
    dispatch(
      control: Uint8Array,
      zeroCopy?: ArrayBufferView | null
    ): Uint8Array | null;
    setAsyncHandler(handler: AsyncHandler): void;
  }

  export interface Plugin {
    ops: {
      [name: string]: PluginOp;
    };
  }

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 打开并初始化插件。
   *
   *        const plugin = Deno.openPlugin("./path/to/some/plugin.so");
   *        const some_op = plugin.ops.some_op;
   *        const response = some_op.dispatch(new Uint8Array([1,2,3,4]));
   *        console.log(`Response from plugin ${response}`);
   *
   * 需要 `allow-plugin` 权限。*/
  export function openPlugin(filename: string): Plugin;
  export interface NetAddr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  export interface UnixAddr {
    transport: "unix" | "unixpacket";
    address: string;
  }

  export type Addr = NetAddr | UnixAddr;
  /** **不稳定**：可能会完全删除 `ShutdownMode`。
   *
   * 对应类 POSIX 系统上的 `SHUT_RD`，`SHUT_WR`，`SHUT_RDWR`。
   *
   * 参阅：http://man7.org/linux/man-pages/man2/shutdown.2.html */
  export enum ShutdownMode {
    Read = 0,
    Write,
    ReadWrite, // TODO(ry) `ReadWrite` 上的异常。
  }

  /** **不稳定**：参数 `how` 和枚举 `ShutdownMode` 都在考虑移除。
   *
   * Shutdown 套接字的发送和接收操作。
   *
   * 与 POSIX 的 shutdown(3) 行为一致。
   *
   *       const listener = Deno.listen({ port: 80 });
   *       const conn = await listener.accept();
   *       Deno.shutdown(conn.rid, Deno.ShutdownMode.Write);
   */
  export function shutdown(rid: number, how: ShutdownMode): void;

  /** **不稳定**：新的 API，尚待审查。
   *
   * 面向消息协议的通用传输监听器。*/
  export interface DatagramConn extends AsyncIterable<[Uint8Array, Addr]> {
    /** **不稳定**：新的 API，尚待审查。
     *
     * 等待并解析 (resolve) 为下一条消息传递给 `UDPConn`。*/
    receive(p?: Uint8Array): Promise<[Uint8Array, Addr]>;
    /** **不稳定**：新的 API，尚待审查。
     *
     * 向目标发送消息。*/
    send(p: Uint8Array, addr: Addr): Promise<void>;
    /** **不稳定**：新的 API，尚待审查。
     *
     * 关闭套接字。任何待处理的消息应答都将被拒绝 (rejected)，并返回错误。*/
    close(): void;
    /** 返回 `UDPConn` 的地址。 */
    readonly addr: Addr;
    [Symbol.asyncIterator](): AsyncIterator<[Uint8Array, Addr]>;
  }

  /** 面向流协议的通用网络监听器。 */
  export interface Listener extends AsyncIterable<Conn> {
    /** 等待并解析 (resolve) 到与 `Listener` 的下一个连接。 */
    accept(): Promise<Conn>;
    /** 关闭监听器。任何待处理的接收应答都将被拒绝 (rejected)，并返回错误。*/
    close(): void;
    /** 返回 `Listener` 的地址。 */
    readonly addr: Addr;

    [Symbol.asyncIterator](): AsyncIterator<Conn>;
  }

  export interface Conn extends Reader, Writer, Closer {
    /** 连接的本地地址。*/
    readonly localAddr: Addr;
    /** 连接的远程地址。*/
    readonly remoteAddr: Addr;
    /** 连接的资源 ID。*/
    readonly rid: number;
    /** 关闭 (`shutdown(2)`) TCP 连接的读取端。大多数调用者应该只使用 `close()`。*/
    closeRead(): void;
    /** 关闭 (`shutdown(2)`) TCP 连接的写入端。大多数调用者应该只使用 `close()`。*/
    closeWrite(): void;
  }

  export interface ListenOptions {
    /** 要监听的端口号 */
    port: number;
    /** 一个 IP 地址或者可以被解析为 IP 地址的主机名。
     * 如果没有指定，默认值为 `0.0.0.0`。 */
    hostname?: string;
  }

  export interface UnixListenOptions {
    /** 一个 Unix 套接字路径。 */
    address: string;
  }
  /** **不稳定**: 新 API，没有经过审查。
   *
   * 在本地监听网络连接。
   *
   *      const listener1 = Deno.listen({ port: 80 })
   *      const listener2 = Deno.listen({ hostname: "192.0.2.1", port: 80 })
   *      const listener3 = Deno.listen({ hostname: "[2001:db8::1]", port: 80 });
   *      const listener4 = Deno.listen({ hostname: "golang.org", port: 80, transport: "tcp" });
   *
   * 需要 `allow-net` 权限。 */
  export function listen(
    options: ListenOptions & { transport?: "tcp" }
  ): Listener;
  /** **不稳定**: 新 API，没有经过审查。
   *
   * 在本地监听网络连接。
   *
   *     const listener = Deno.listen({ address: "/foo/bar.sock", transport: "unix" })
   *
   * 需要 `allow-read` 权限。 */
  export function listen(
    options: UnixListenOptions & { transport: "unix" }
  ): Listener;
  /** **不稳定**: 新 API，没有经过审查。
   *
   * 在本地监听网络连接。
   *
   *      const listener1 = Deno.listen({ port: 80, transport: "udp" })
   *      const listener2 = Deno.listen({ hostname: "golang.org", port: 80, transport: "udp" });
   *
   * 需要 `allow-net` 权限。 */
  export function listen(
    options: ListenOptions & { transport: "udp" }
  ): DatagramConn;
  /** **不稳定**: 新 API，没有经过审查。
   *
   * 在本地监听网络连接。
   *
   *     const listener = Deno.listen({ address: "/foo/bar.sock", transport: "unixpacket" })
   *
   * 需要 `allow-read` 权限。 */
  export function listen(
    options: UnixListenOptions & { transport: "unixpacket" }
  ): DatagramConn;

  export interface ListenTLSOptions extends ListenOptions {
    /** 服务器证书文件。 */
    certFile: string;
    /** 服务器公钥文件。 */
    keyFile: string;

    transport?: "tcp";
  }

  /** 在本地监听来自 TLS （传输层安全性协议）的网络连接。
   *
   *      const lstnr = Deno.listenTLS({ port: 443, certFile: "./server.crt", keyFile: "./server.key" });
   *
   * 需要 `allow-net` 权限。 */
  export function listenTLS(options: ListenTLSOptions): Listener;

  export interface ConnectOptions {
    /** 要连接的端口号。 */
    port: number;
    /** 一个 IP 地址或者可以被解析为 IP 地址的主机名。
     * 如果没有指定，默认值为 `127.0.0.1`。 */
    hostname?: string;
    transport?: "tcp";
  }

  export interface UnixConnectOptions {
    transport: "unix";
    address: string;
  }

  /**
   * 通过指定传输协议（默认 "tcp"）连接主机名（默认 "127.0.0.1"）和端口号，并异步返回这个连接（`Conn`）。
   *
   *     const conn1 = await Deno.connect({ port: 80 });
   *     const conn2 = await Deno.connect({ hostname: "192.0.2.1", port: 80 });
   *     const conn3 = await Deno.connect({ hostname: "[2001:db8::1]", port: 80 });
   *     const conn4 = await Deno.connect({ hostname: "golang.org", port: 80, transport: "tcp" });
   *     const conn5 = await Deno.connect({ address: "/foo/bar.sock", transport: "unix" });
   *
   * "tcp" 需要 `allow-net` 权限，unix 需要 `allow-read` 权限。
   * */
  export function connect(
    options: ConnectOptions | UnixConnectOptions
  ): Promise<Conn>;

  export interface ConnectTLSOptions {
    /** 要连接的端口。*/
    port: number;
    /** 可以解析为 IP 地址的文本 IP 地址或主机名。如果没有指定，默认值为 `127.0.0.1`。*/
    hostname?: string;
    /** 服务器证书文件。*/
    certFile?: string;
  }

  /** 使用可选的证书文件、主机名（默认值为 "127.0.0.1"）
   * 和端口在 TLS（安全传输层协议）建立安全连接。
   * 证书文件是可选的，如果不包含，则使用 Mozilla 的根证书
   *（具体参见 https://github.com/ctz/webpki-roots）。
   *
   *     const conn1 = await Deno.connectTLS({ port: 80 });
   *     const conn2 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "192.0.2.1", port: 80 });
   *     const conn3 = await Deno.connectTLS({ hostname: "[2001:db8::1]", port: 80 });
   *     const conn4 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "golang.org", port: 80});
   *
   * 需要 `allow-net` 权限。
   */
  export function connectTLS(options: ConnectTLSOptions): Promise<Conn>;

  /** **不稳定**: not sure if broken or not */
  export interface Metrics {
    opsDispatched: number;
    opsDispatchedSync: number;
    opsDispatchedAsync: number;
    opsDispatchedAsyncUnref: number;
    opsCompleted: number;
    opsCompletedSync: number;
    opsCompletedAsync: number;
    opsCompletedAsyncUnref: number;
    bytesSentControl: number;
    bytesSentData: number;
    bytesReceived: number;
  }

  /** 从 Deno 的特权方接收指标。
   * 这主要用于 Deno 的开发中。
   * 'Ops'（也称为 'bindings'）是 Deno Javascript 和 Deno Rust 之间的沟通桥梁。
   *
   *      > console.table(Deno.metrics())
   *      ┌─────────────────────────┬────────┐
   *      │         (index)         │ Values │
   *      ├─────────────────────────┼────────┤
   *      │      opsDispatched      │   3    │
   *      │    opsDispatchedSync    │   2    │
   *      │   opsDispatchedAsync    │   1    │
   *      │ opsDispatchedAsyncUnref │   0    │
   *      │      opsCompleted       │   3    │
   *      │    opsCompletedSync     │   2    │
   *      │    opsCompletedAsync    │   1    │
   *      │ opsCompletedAsyncUnref  │   0    │
   *      │    bytesSentControl     │   73   │
   *      │      bytesSentData      │   0    │
   *      │      bytesReceived      │  375   │
   *      └─────────────────────────┴────────┘
   */
  export function metrics(): Metrics;

  /** **不稳定**: 重新考虑表示方法。 */
  interface ResourceMap {
    [rid: number]: string;
  }

  /** **不稳定**: 返回类型正在考虑中，并且可能会更改。
   *
   * 返回打开的_文件_资源 ID（rid）及其字符串表示形式的 Map。
   *
   *       console.log(Deno.resources()); // e.g. { 0: "stdin", 1: "stdout", 2: "stderr" }
   *       Deno.openSync('../test.file');
   *       console.log(Deno.resources()); // e.g. { 0: "stdin", 1: "stdout", 2: "stderr", 3: "fsFile" }
   */
  export function resources(): ResourceMap;

  /** **不稳定**: 新 API。需要补充文档。 */
  export interface FsEvent {
    kind: "any" | "access" | "create" | "modify" | "remove";
    paths: string[];
  }

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 监听一个或多个路径的文件系统事件，这个路径可以是文件或者目录，但是必须存在。
   * 一个用户操作（例如 `touch test.file`）可以产生多个文件系统事件。同样，一个
   * 用户操作也可能在一次事件中影响多个路径（例如 `mv old_name.txt new_name.txt`）。
   * 递归选项默认为 `true`，对于目录，将监听指定目录及其所有子目录。
   * 值得注意的是，不同操作系统的事件顺序可能会有所不同。
   *
   *       const iter = Deno.fsEvents("/");
   *       for await (const event of iter) {
   *          console.log(">>>> event", event);  // e.g. { kind: "create", paths: [ "/foo.txt" ] }
   *       }
   *
   * 需要 `allow-read` 权限。
   */
  export function fsEvents(
    paths: string | string[],
    options?: { recursive: boolean }
  ): AsyncIterableIterator<FsEvent>;

  /** 如何处理子进程的 stdio。
   *
   * `"inherit"` 如果未指定，则为默认值。子进程继承父进程的 stdio。
   *
   * `"piped"` 使用一个新管道来连接父子进程。
   *
   * `"null"` 输入输出流将被忽略。这相当于将流附加到了 `/dev/null`。 */
  type ProcessStdio = "inherit" | "piped" | "null";

  /** **UNSTABLE**: `signo` 参数可能需要改成 Deno.Signal 枚举。
   *
   * 给指定的 `pid` 进程发送信号。这个功能目前只在 Linux 和 Mac OS 上运行。
   *
   * 当 `pid` 是负的，信号将会发送到带有 `pid` 标识的进程组。
   *
   *      const p = Deno.run({
   *        cmd: ["python", "-c", "from time import sleep; sleep(10000)"]
   *      });
   *
   *      Deno.kill(p.pid, Deno.Signal.SIGINT);
   *
   * 在 Windows 上抛出错误（尚未实现）。
   *
   * 需要 `allow-run` 权限。 */
  export function kill(pid: number, signo: number): void;

  /** **UNSTABLE**: 这里有一些关于如何结束进程的问题需要解决。 */
  export class Process {
    readonly rid: number;
    readonly pid: number;
    readonly stdin?: WriteCloser;
    readonly stdout?: ReadCloser;
    readonly stderr?: ReadCloser;
    /** 解析进程当前的状态。 */
    status(): Promise<ProcessStatus>;
    /** 缓冲区中的 stdout，会在 `Deno.EOF` 之后以 `Uint8Array` 的形式返回。
     *
     * 在创建进程时，你必须将 stdout 设置为 `"piped"`。
     *
     * 会在 stdout 完成后调用 `close()`。 */
    output(): Promise<Uint8Array>;
    /** 缓冲区中的 stderr， 会在 `Deno.EOF` 之后以 `Uint8Array` 的形式返回。
     *
     * 在创建进程时，你必须将 stderr 设置为 `"piped"`。
     *
     * 会在 stderr 完成后调用 `close()`。 */
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
    kill(signo: number): void;
  }

  export interface ProcessStatus {
    success: boolean;
    code?: number;
    signal?: number;
  }

  /** **不稳定**: `args` 最近被重命名为 `cmd`，以区别于 `Deno.args`。 */
  export interface RunOptions {
    /** 需要传递的参数。注意，第一个元素必须是二进制文件的路径。 */
    cmd: string[];
    cwd?: string;
    env?: {
      [key: string]: string;
    };
    stdout?: ProcessStdio | number;
    stderr?: ProcessStdio | number;
    stdin?: ProcessStdio | number;
  }

  /** 派生新的子进程。 RunOptions 必须包含 `opt.cmd`，即程序参数数组，其中第一个参数是二进制文件路径。
   *
   * 子进程使用与父进程相同的工作目录，除非指定了 `opt.cwd`。
   *
   * 子进程的环境变量可以使用 `opt.env` 来设置
   *
   * 默认情况下，子进程继承父进程的 stdio。要更改这些值，可以分别指定`opt.stdout`、`opt.stderr`、`opt.stdin`
   * - 可以将其设置为 `ProcessStdio` 或打开文件的 `rid`。
   *
   * 返回派生子进程的详细信息。
   *
   *       const p = Deno.run({
   *         cmd: ["echo", "hello"],
   *       });
   *
   * 需要 `allow-run` 权限。 */
  export function run(opt: RunOptions): Process;

  enum LinuxSignal {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGBUS = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGUSR1 = 10,
    SIGSEGV = 11,
    SIGUSR2 = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGSTKFLT = 16,
    SIGCHLD = 17,
    SIGCONT = 18,
    SIGSTOP = 19,
    SIGTSTP = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGURG = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGIO = 29,
    SIGPWR = 30,
    SIGSYS = 31,
  }
  enum MacOSSignal {
    SIGHUP = 1,
    SIGINT = 2,
    SIGQUIT = 3,
    SIGILL = 4,
    SIGTRAP = 5,
    SIGABRT = 6,
    SIGEMT = 7,
    SIGFPE = 8,
    SIGKILL = 9,
    SIGBUS = 10,
    SIGSEGV = 11,
    SIGSYS = 12,
    SIGPIPE = 13,
    SIGALRM = 14,
    SIGTERM = 15,
    SIGURG = 16,
    SIGSTOP = 17,
    SIGTSTP = 18,
    SIGCONT = 19,
    SIGCHLD = 20,
    SIGTTIN = 21,
    SIGTTOU = 22,
    SIGIO = 23,
    SIGXCPU = 24,
    SIGXFSZ = 25,
    SIGVTALRM = 26,
    SIGPROF = 27,
    SIGWINCH = 28,
    SIGINFO = 29,
    SIGUSR1 = 30,
    SIGUSR2 = 31,
  }

  /** **不稳定**: make platform independent.
   *
   * 信号数字。此值是独立于平台的。 */
  export const Signal: typeof MacOSSignal | typeof LinuxSignal;

  interface InspectOptions {
    showHidden?: boolean;
    depth?: number;
    colors?: boolean;
    indentLevel?: number;
  }

  /** **不稳定**：字符串输出的确切形式仍在考虑，可能会更改。
   *
   * 将输入转换为与 `console.log()` 打印格式相同的字符串。
   *
   *      const obj = {};
   *      obj.propA = 10;
   *      obj.propB = "hello"
   *      const objAsString = Deno.inspect(obj); // { propA: 10, propB: "hello" }
   *      console.log(obj);  // 输出与 objAsString 相同的值，例如: { propA: 10, propB: "hello" }
   *
   * 你还可以通过对象上的 `Deno.symbols.customInspect` 函数
   * 注册自定义的 inspect function，以控制和自定义输出。
   *
   *      class A {
   *        x = 10;
   *        y = "hello";
   *        [Deno.symbols.customInspect](): string {
   *          return "x=" + this.x + ", y=" + this.y;
   *        }
   *      }
   *
   *      const inStringFormat = Deno.inspect(new A()); // "x=10, y=hello"
   *      console.log(inStringFormat);  // 输出 "x=10, y=hello"
   *
   * 同时还提供了一些输出选项。
   *
   *      const out = Deno.inspect(obj, {showHidden: true, depth: 4, colors: true, indentLevel: 2});
   *
   */
  export function inspect(value: unknown, options?: InspectOptions): string;

  export type OperatingSystem = "mac" | "win" | "linux";

  export type Arch = "x64" | "arm64";

  interface BuildInfo {
    /** CPU 架构。 */
    arch: Arch;
    /** 操作系统。 */
    os: OperatingSystem;
  }

  /** 构建的相关信息。 */
  export const build: BuildInfo;

  interface Version {
    deno: string;
    v8: string;
    typescript: string;
  }
  /** Deno 的详细版本信息。包括了 deno、v8、typescript。 */
  export const version: Version;

  /** 诊断消息的日志类别。 */
  export enum DiagnosticCategory {
    Log = 0,
    Debug = 1,
    Info = 2,
    Error = 3,
    Warning = 4,
    Suggestion = 5,
  }

  export interface DiagnosticMessageChain {
    message: string;
    category: DiagnosticCategory;
    code: number;
    next?: DiagnosticMessageChain[];
  }

  export interface DiagnosticItem {
    /** 诊断信息总结。*/
    message: string;
    /** 进一步诊断的有序数组。*/
    messageChain?: DiagnosticMessageChain;
    /** 与诊断相关的信息。当有建议或其他附加诊断信息时会出现。*/
    relatedInformation?: DiagnosticItem[];
    /** 与诊断相关的源代码。*/
    sourceLine?: string;
    /** 与诊断相关的行号。*/
    lineNumber?: number;
    /** 与诊断相关的文件名称。*/
    scriptResourceName?: string;
    /** 与诊断相关的起始位置。*/
    startPosition?: number;
    /** 与诊断相关的结束位置。*/
    endPosition?: number;
    /** 诊断消息的日志类别。*/
    category: DiagnosticCategory;
    /** 数字标识符。*/
    code: number;
    /** 与诊断相关的 sourceLine 的开始列。*/
    startColumn?: number;
    /** 与诊断相关的 sourceLine 的结束列。*/
    endColumn?: number;
  }

  export interface Diagnostic {
    /** 诊断信息数组。*/
    items: DiagnosticItem[];
  }

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 格式化诊断信息数组，并以用户友好的格式将其作为单个字符串返回。
   *
   *       const [diagnostics, result] = Deno.compile("file_with_compile_issues.ts");
   *       console.table(diagnostics);  // 输出原始诊断信息
   *       console.log(Deno.formatDiagnostics(diagnostics));  // 用户友好方式的输出诊断信息
   *
   * @param items 要格式化的诊断信息数组
   */
  export function formatDiagnostics(items: DiagnosticItem[]): string;

  /** **不稳定**: 新 API，没有经过审查。
   *
   * TypeScript 编译选项的特定子集，这些选项能够被 Deno 内置的 TypeScript 编译器支持。 */
  export interface CompilerOptions {
    /** 允许编译 JavaScript 文件。默认为 `true`。 */
    allowJs?: boolean;
    /** 允许从没有设置默认导出的模块中默认导入。这并不影响代码的输出，仅为了类型检查。默认为 `false`。 */
    allowSyntheticDefaultImports?: boolean;
    /** 允许从模块中访问 UMD 全局变量。默认为 `false`。 */
    allowUmdGlobalAccess?: boolean;
    /** 不报告执行不到的代码错误。默认为 `false`。 */
    allowUnreachableCode?: boolean;
    /** 不报告未使用的标签错误。默认为 `false`。 */
    allowUnusedLabels?: boolean;
    /** 以严格模式解析源文件并为每个源文件生成 `"use strict"` 语句。
     * 默认为 `true`。 */
    alwaysStrict?: boolean;
    /** 解析非相对模块名的基准目录。默认为 `undefined`。 */
    baseUrl?: string;
    /** 报告 `.js` 文件中存在的错误。与 `allowJs` 配合使用。默认为 `false`。 */
    checkJs?: boolean;
    /** 生成相应的 `.d.ts` 文件。默认为 `false`。 */
    declaration?: boolean;
    /** 生成声明文件的输出路径。 */
    declarationDir?: string;
    /** 为每个 `.d.ts` 文件生成 ource map。默认为 `false`。 */
    declarationMap?: boolean;
    /** 当编译目标设置为 ES5 或 ES3 时，为 `for..of`、数组解构、数组展开提供完整的迭代支持。默认为 `false`。 */
    downlevelIteration?: boolean;
    /** 在输出文件的开头加入 BOM 头（UTF-8 Byte Order Mark）。默认为 `false`。 */
    emitBOM?: boolean;
    /** 只输出 `.d.ts` 文件。默认为 `false`。 */
    emitDeclarationOnly?: boolean;
    /** 给源码里的装饰器声明加上设计类型元数据。查看
     * [microsoft/TypeScript#2577](https://github.com/Microsoft/TypeScript/issues/2577)
     * 了解更多信息。默认为 `false`。 */
    emitDecoratorMetadata?: boolean;
    /** 为了兼容 babel 运行时生态，输出 `__importStar` 和 `__importDefault` 辅助函数并且开启 `allowSyntheticDefaultImports` 选项。默认为 `true`。 */
    esModuleInterop?: boolean;
    /** 启用实验性的 ES 装饰器。默认为 `false`。 */
    experimentalDecorators?: boolean;
    /** 生成单个 source maps 文件，而不是将每 source maps 生成不同的文件。
     * 默认为 `false`。 */
    inlineSourceMap?: boolean;
    /** 将代码与 source maps 生成到一个文件中，要求同时设置了 `inlineSourceMap` or `sourceMap` 选项。默认为 `false`。 */
    inlineSources?: boolean;
    /** 执行额外的检查，确保我的程序代码可以被不进行任何类型检查的编译器正确地编译。
     * 默认为 `false`。 */
    isolatedModules?: boolean;
    /** 为 `.tsx` 文件提供 JSX 支持：`"react"`, `"preserve"`, `"react-native"`。
     * 默认为 `"react"`。 */
    jsx?: "react" | "preserve" | "react-native";
    /** 指定生成目标为 JSX 时，使用的 JSX 工厂函数，比如 `React.createElement` 或 `h`。默认为 `React.createElement`。 */
    jsxFactory?: string;
    /** 只解析字符串属性的 keyof (忽略 numbers 和
     * symbols)。默认为 `false`。 */
    keyofStringsOnly?: string;
    /** Emit class fields with ECMAScript-standard semantics. 默认为 `false`。
     * Does not apply to `"esnext"` target. */
    useDefineForClassFields?: boolean;
    /** 编译过程中需要引入的库文件的列表。当输出时，Deno 的核心运行库也会使用。 */
    lib?: string[];
    /** 显示错误信息时使用的语言。 */
    locale?: string;
    /** 为调试器指定指定 source map 文件的路径，而不是使用生成时的路径。
     * 当 `.map` 文件是在运行时指定的，并不同于 `.js` 文件的地址时使用这个标记。
     * 指定的路径会嵌入到 source map 里告诉调试器到哪里去找它们。默认为 `undefined`。 */
    mapRoot?: string;
    /** 指定生成哪个模块系统代码。默认为 `"esnext"`。 */
    module?:
      | "none"
      | "commonjs"
      | "amd"
      | "system"
      | "umd"
      | "es6"
      | "es2015"
      | "esnext";
    /** 不在输出文件中生成用户自定义的帮助函数代码，如 `__extends`。默认为 `false`。 */
    noEmitHelpers?: boolean;
    /** 报告 `switch` 语句的 fallthrough 错误。默认为 `false`。 */
    noFallthroughCasesInSwitch?: boolean;
    /** 在表达式和声明上有隐含的 `any` 类型时报错。
     * 默认为 `true`。 */
    noImplicitAny?: boolean;
    /** 当函数的所有返回路径存在没有 `return` 的情况时报错。
     * 默认为 `false`。 */
    noImplicitReturns?: boolean;
    /** 当 `this` 表达式的值为 `any` 类型的时候报错。默认为 `true`。*/
    noImplicitThis?: boolean;
    /** 不要在模块输出中包含 `"use strict"` 指令。默认为 `false`。 */
    noImplicitUseStrict?: boolean;
    /** 不把 `/// <reference>` 或模块导入的文件加到编译文件列表。默认为 `false`。 */
    noResolve?: boolean;
    /** 禁用在函数类型里对泛型签名进行严格检查。默认为 `false`。 */
    noStrictGenericChecks?: boolean;
    /** 当存在未使用的局部变量时报错。默认为 `false`。 */
    noUnusedLocals?: boolean;
    /** 当存在未使用的参数时报错。默认为 `false`。 */
    noUnusedParameters?: boolean;
    /** 重定向输出目录。这个只影响 `Deno.compile` 并且只改变输出文件的名字。默认为 `undefined`。 */
    outDir?: string;
    /** 模块名到基于 `baseUrl` 的路径映射的列表。默认为 `undefined`。 */
    paths?: Record<string, string[]>;
    /** Do not erase const enum declarations in generated code. 默认为 `false`。 */
    preserveConstEnums?: boolean;
    /** Remove all comments except copy-right header comments beginning with
     * `/*!`. 默认为 `true`。 */
    removeComments?: boolean;
    /** Include modules imported with `.json` extension. 默认为 `true`。 */
    resolveJsonModule?: boolean;
    /** Specifies the root directory of input files. Only use to control the
     * output directory structure with `outDir`. 默认为 `undefined`。 */
    rootDir?: string;
    /** List of _root_ folders whose combined content represent the structure of
     * the project at runtime. 默认为 `undefined`。 */
    rootDirs?: string[];
    /** Generates corresponding `.map` file. 默认为 `false`。 */
    sourceMap?: boolean;
    /** Specifies the location where debugger should locate TypeScript files
     * instead of source locations. Use this flag if the sources will be located
     * at run-time in a different location than that at design-time. The location
     * specified will be embedded in the sourceMap to direct the debugger where
     * the source files will be located. 默认为 `undefined`。 */
    sourceRoot?: string;
    /** Enable all strict type checking options. Enabling `strict` enables
     * `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`,
     * `strictNullChecks`, `strictFunctionTypes` and
     * `strictPropertyInitialization`. 默认为 `true`。 */
    strict?: boolean;
    /** Enable stricter checking of the `bind`, `call`, and `apply` methods on
     * functions. 默认为 `true`。 */
    strictBindCallApply?: boolean;
    /** Disable bivariant parameter checking for function types. 默认为 `true`。 */
    strictFunctionTypes?: boolean;
    /** Ensure non-undefined class properties are initialized in the constructor.
     * This option requires `strictNullChecks` be enabled in order to take effect.
     * 默认为 `true`。 */
    strictPropertyInitialization?: boolean;
    /** In strict null checking mode, the `null` and `undefined` values are not in
     * the domain of every type and are only assignable to themselves and `any`
     * (the one exception being that `undefined` is also assignable to `void`). */
    strictNullChecks?: boolean;
    /** 阻止对对象字面量的额外属性检查。默认为 `false`。 */
    suppressExcessPropertyErrors?: boolean;
    /** 阻止 `noImplicitAny` 对缺少索引签名的索引对象报错。*/
    suppressImplicitAnyIndexErrors?: boolean;
    /** 指定 ECMAScript 目标版本。默认为 `esnext`。 */
    target?:
      | "es3"
      | "es5"
      | "es6"
      | "es2015"
      | "es2016"
      | "es2017"
      | "es2018"
      | "es2019"
      | "es2020"
      | "esnext";
    /** List of names of type definitions to include. 默认为 `undefined`。
     *
     * The type definitions are resolved according to the normal Deno resolution
     * irrespective of if sources are provided on the call. Like other Deno
     * modules, there is no "magical" resolution. For example:
     *
     *      Deno.compile(
     *        "./foo.js",
     *        undefined,
     *        {
     *          types: [ "./foo.d.ts", "https://deno.land/x/example/types.d.ts" ]
     *        }
     *      );
     */
    types?: string[];
  }

  /** **不稳定**：新的 API，尚待审核。
   *
   * transpile only 命令的结果，其中 `source`
   * 为转化后的源码，而 `map` 则为源码的 source map。*/
  export interface TranspileOnlyResult {
    source: string;
    map?: string;
  }

  /** **不稳定**：新的 API，尚待审核。
   *
   * 给定一组 TypeScript 类型的源码 (sources)，返回解析后的映射，
   * 其中的 key 是 sources 的 key，结果则包含转化过的源码及源码的 source map。
   * 此函数并不进行类型校检，它可以有效地从文件中 “删除” 类型。
   *
   *      const results =  await Deno.transpileOnly({
   *        "foo.ts": `const foo: string = "foo";`
   *      });
   *
   * @param sources key 是文件名，value 是要转换的源码。
   *                文件扩展名并不会被解析，仅用作解析结果的 key。
   * @param options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function transpileOnly(
    sources: Record<string, string>,
    options?: CompilerOptions
  ): Promise<Record<string, TranspileOnlyResult>>;

  /** **不稳定**：新的 API，尚待审核。
   *
   * 它接受根模块名 rootName，及 Record<string, string> 类型的可选参数
   * sources 做为模块源。返回编译后的模块集合及编译过程中遇到的问题的诊断信息。
   *
   * 如果仅传了 rootName，那么模块解析结果同命令行一致。
   *
   * 如果传递了 sources，则所有模块都将从该 sources 对象中解析出来，
   * 其中键是模块名称，值是内容。模块名称的扩展名将用于确定模块的类型。
   *
   *      const [ maybeDiagnostics1, output1 ] = await Deno.compile("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.compile("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName 作为 “起点” 的模块名。如果没有传递 `sources` 参数,
   *                 Deno 将从外部解析模块，就像在命令行中指定了 `rootName` 一样。
   * @param sources 可选参数，解析模块时使用的 key/value 对象，其中 key 是模块名，value 是源内容。
   *                key 的扩展名决定了解析模块的类型。如果提供此参数，Deno 将不会尝试从外部解析任何模块。
   * @param options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function compile(
    rootName: string,
    sources?: Record<string, string>,
    options?: CompilerOptions
  ): Promise<[DiagnosticItem[] | undefined, Record<string, string>]>;

  /** **不稳定**：新的 API，尚待审核。
   *
   * `bundle()` 是编译器 API 的一部分。有关此功能的完整说明，
   * 请参见 [手册](https://deno.land/std/manual.md#denobundle)。
   *
   * 它接受根模块名 rootName，及可选参数 sources 做为模块源。
   * 就像使用 `deno bundle` 命令输出的结果一样，其返回值是一个
   * JavaScript 字符串（如果在打包过程中出现错误, 则会返回错误诊断信息）。
   *
   * 如果仅传了 rootName，那么模块解析结果同命令行一致。
   *
   * 如果传递了 sources，则所有模块都将从该 sources 对象中解析出来，
   * 其中键是模块名称，值是内容。模块名称的扩展名将用于确定模块的类型。
   *
   *      // 相当于执行 "deno bundle foo.ts" 命令
   *      const [ maybeDiagnostics1, output1 ] = await Deno.bundle("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.bundle("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName 作为 “起点” 的模块名。如果没有传递 `sources` 参数,
   *                 Deno 将从外部解析模块，就像在命令行中指定了 `rootName` 一样。
   * @param sources 可选参数，解析模块时使用的 key/value 对象，其中 key 是模块名，value 是源内容。
   *                key 的扩展名决定了解析模块的类型。如果提供此参数，Deno 将不会尝试从外部解析任何模块。
   * @param options 编译选项。这是可以被 Deno 支持的 ts.CompilerOptions 选项的一个子集。
   */
  export function bundle(
    rootName: string,
    sources?: Record<string, string>,
    options?: CompilerOptions
  ): Promise<[DiagnosticItem[] | undefined, string]>;

  /** 将脚本参数返回给程序。例如我们运行下方的程序:
   *
   *      deno --allow-read https://deno.land/std/examples/cat.ts /etc/passwd
   *
   * 然后 `Deno.args` 将包含:
   *
   *      [ "/etc/passwd" ]
   */
  export const args: string[];

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 信号流，实现了 `AsyncIterator` 和 `PromiseLike` 接口。 */
  export class SignalStream
    implements AsyncIterableIterator<void>, PromiseLike<void> {
    constructor(signal: typeof Deno.Signal);
    then<T, S>(
      f: (v: void) => T | Promise<T>,
      g?: (v: void) => S | Promise<S>
    ): Promise<T | S>;
    next(): Promise<IteratorResult<void>>;
    [Symbol.asyncIterator](): AsyncIterableIterator<void>;
    dispose(): void;
  }

  /** **不稳定**: 新 API，没有经过审查。
   *
   * 返回指定信号编码的流。返回值可用于异步迭代。
   *
   *      for await (const _ of Deno.signal(Deno.Signal.SIGTERM)) {
   *        console.log("got SIGTERM!");
   *      }
   *
   * 也可以把它作为 Promise 来使用。在这种情况下，只能收到第一个值。
   *
   *      await Deno.signal(Deno.Signal.SIGTERM);
   *      console.log("SIGTERM received!")
   *
   * 如果要停止接收信号，可以使用信号流对象(`SignalStream`)的 `.dispose()` 方法。
   *
   *      const sig = Deno.signal(Deno.Signal.SIGTERM);
   *      setTimeout(() => { sig.dispose(); }, 5000);
   *      for await (const _ of sig) {
   *        console.log("SIGTERM!")
   *      }
   *
   * 当调用 `sig.dispose()` 5 秒后，上述 for-await 循环退出。
   *
   * 注意: 这个功能还没有在 Windows 上实现。
   */
  export function signal(signo: number): SignalStream;

  /** **不稳定**: 新 API，没有经过审查。 */
  export const signals: {
    /** 返回 SIGALRM 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGALRM)` 的简写形式。 */
    alarm: () => SignalStream;
    /** 返回 SIGCHLD 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGCHLD)` 的简写形式。 */
    child: () => SignalStream;
    /** 返回 SIGHUP 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGHUP)` 的简写形式。 */
    hungup: () => SignalStream;
    /** 返回 SIGINT 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGINT)` 的简写形式。 */
    interrupt: () => SignalStream;
    /** 返回 SIGIO 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGIO)` 的简写形式。 */
    io: () => SignalStream;
    /** 返回 SIGPIPE 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGPIPE)` 的简写形式。 */
    pipe: () => SignalStream;
    /** 返回 SIGQUIT 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGQUIT)` 的简写形式。 */
    quit: () => SignalStream;
    /** 返回 SIGTERM 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGTERM)` 的简写形式。 */
    terminate: () => SignalStream;
    /** 返回 SIGUSR1 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGUSR1)` 的简写形式。 */
    userDefined1: () => SignalStream;
    /** 返回 SIGUSR2 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGUSR2)` 的简写形式。 */
    userDefined2: () => SignalStream;
    /** 返回 SIGWINCH 信号流。
     *
     * 此方法是 `Deno.signal(Deno.Signal.SIGWINCH)` 的简写形式。 */
    windowChange: () => SignalStream;
  };

  /** **不稳定**: 新 API。可能会把 `Deno.EOF` 移动到这里。
   *
   * 和 Deno 相关的 `Symbol`。 */
  export const symbols: {
    /** 用于将 Deno 内部 API 暴露出来的 Symbol */
    readonly internal: unique symbol;
    /** 这个 Symbol 可以作为 key 来定义一个方法，当 `Deno.inspect()` 被调用或者调用了
     * console 的日志方法时，这个自定义函数被调用。 */
    readonly customInspect: unique symbol;
    // TODO(ry) move EOF here?
  };
}
