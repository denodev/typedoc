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
   *        console.log(runInfo.stats.passed);  //e.g. 1
   *        console.log(runInfo.results[0].name);  //e.g. "example test"
   */
  export function runTests(
    opts?: RunTestsOptions
  ): Promise<TestMessage["end"]> & {};

  /** 返回 1 分钟、5 分钟和 15 分钟平均负载的数组。
   * 平均负载是对最后 1 分钟、5 分钟和 15 分钟的 CPU 以及 IO 利用率的度量，以分数表示。
   * `0` 表示没有负载。
   * 在 Windows 上，这 3 个值始终相同，代表当前负载，而不是 1 分钟、5 分钟和 15 分钟的平均负载。
   *
   *       console.log(Deno.loadavg());  //e.g. [ 0.71, 0.44, 0.44 ]
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
   *       console.log(myEnv.TEST_VAR === newEnv.TEST_VAR);  //outputs "true"
   *
   * 需要 `allow-env` 权限 */
  export function env(): {
    [index: string]: string;
  };

  /** 获取环境变量的值。如果 `key` 不存在，则返回 `undefined`。
   *
   *       console.log(Deno.env("HOME"));  //e.g. outputs "/home/alice"
   *       console.log(Deno.env("MADE_UP_VAR"));  //outputs "Undefined"
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
   *       console.log(Deno.execPath());  //e.g. "/home/alice/.local/bin/deno"
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
   *        console.log(Deno.umask());  //e.g. 18 (0o022)
   *        const prevUmaskValue = Deno.umask(0o077);  //e.g. 18 (0o022)
   *        console.log(Deno.umask());  //e.g. 63 (0o077)
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
    /** Seek sets the offset for the next `read()` or `write()` to offset,
     * interpreted according to `whence`: `SEEK_START` means relative to the
     * start of the file, `SEEK_CURRENT` means relative to the current offset,
     * and `SEEK_END` means relative to the end. Seek resolves to the new offset
     * relative to the start of the file.
     *
     * Seeking to an offset before the start of the file is an error. Seeking to
     * any positive offset is legal, but the behavior of subsequent I/O
     * operations on the underlying object is implementation-dependent.
     * It returns the number of cursor position.
     */
    seek(offset: number, whence: SeekMode): Promise<number>;
  }

  export interface SyncSeeker {
    /** Seek sets the offset for the next `readSync()` or `writeSync()` to
     * offset, interpreted according to `whence`: `SEEK_START` means relative
     * to the start of the file, `SEEK_CURRENT` means relative to the current
     * offset, and `SEEK_END` means relative to the end.
     *
     * Seeking to an offset before the start of the file is an error. Seeking to
     * any positive offset is legal, but the behavior of subsequent I/O
     * operations on the underlying object is implementation-dependent.
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

  /** Synchronously seek a resource ID (`rid`) to the given `offset` under mode
   * given by `whence`.  The new position within the resource (bytes from the
   * start) is returned.
   *
   *        const file = Deno.openSync('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        Deno.writeSync(file.rid, new TextEncoder().encode("Hello world"));
   *        //advance cursor 6 bytes
   *        const cursorPosition = Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        file.readSync(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * The seek modes work as follows:
   *
   *        //Given file.rid pointing to file with "Hello world", which is 11 bytes long:
   *        //Seek 6 bytes from the start of the file
   *        console.log(Deno.seekSync(file.rid, 6, Deno.SeekMode.SEEK_START)); //"6"
   *        //Seek 2 more bytes from the current position
   *        console.log(Deno.seekSync(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); //"8"
   *        //Seek backwards 2 bytes from the end of the file
   *        console.log(Deno.seekSync(file.rid, -2, Deno.SeekMode.SEEK_END)); //"9" (e.g. 11-2)
   */
  export function seekSync(
    rid: number,
    offset: number,
    whence: SeekMode
  ): number;

  /** Seek a resource ID (`rid`) to the given `offset` under mode given by `whence`.
   * The call resolves to the new position within the resource (bytes from the start).
   *
   *        const file = await Deno.open('hello.txt', {read: true, write: true, truncate: true, create: true});
   *        await Deno.write(file.rid, new TextEncoder().encode("Hello world"));
   *        //advance cursor 6 bytes
   *        const cursorPosition = await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START);
   *        console.log(cursorPosition);  // 6
   *        const buf = new Uint8Array(100);
   *        await file.read(buf);
   *        console.log(new TextDecoder().decode(buf)); // "world"
   *
   * The seek modes work as follows:
   *
   *        //Given file.rid pointing to file with "Hello world", which is 11 bytes long:
   *        //Seek 6 bytes from the start of the file
   *        console.log(await Deno.seek(file.rid, 6, Deno.SeekMode.SEEK_START)); //"6"
   *        //Seek 2 more bytes from the current position
   *        console.log(await Deno.seek(file.rid, 2, Deno.SeekMode.SEEK_CURRENT)); //"8"
   *        //Seek backwards 2 bytes from the end of the file
   *        console.log(await Deno.seek(file.rid, -2, Deno.SeekMode.SEEK_END)); //"9" (e.g. 11-2)
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

  /** Write all the content of the array buffer (`arr`) to the writer (`w`).
   *
   *       //Example writing to stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       await Deno.writeAll(Deno.stdout, contentBytes);
   *
   *       //Example writing to file
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = await Deno.open('test.file', {write: true});
   *       await Deno.writeAll(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       //Example writing to buffer
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const writer = new Deno.Buffer();
   *       await Deno.writeAll(writer, contentBytes);
   *       console.log(writer.bytes().length);  // 11
   */
  export function writeAll(w: Writer, arr: Uint8Array): Promise<void>;

  /** Synchronously write all the content of the array buffer (`arr`) to the
   * writer (`w`).
   *
   *       //Example writing to stdout
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       Deno.writeAllSync(Deno.stdout, contentBytes);
   *
   *       //Example writing to file
   *       const contentBytes = new TextEncoder().encode("Hello World");
   *       const file = Deno.openSync('test.file', {write: true});
   *       Deno.writeAllSync(file, contentBytes);
   *       Deno.close(file.rid);
   *
   *       //Example writing to buffer
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

  /** Synchronously creates a new temporary directory in the default directory
   * for temporary files (see also `Deno.dir("temp")`), unless `dir` is specified.
   * Other optional options include prefixing and suffixing the directory name
   * with `prefix` and `suffix` respectively.
   *
   * The full path to the newly created directory is returned.
   *
   * Multiple programs calling this function simultaneously will create different
   * directories. It is the caller's responsibility to remove the directory when
   * no longer needed.
   *
   *       const tempDirName0 = Deno.makeTempDirSync();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = Deno.makeTempDirSync({ prefix: 'my_temp' });  // e.g. /tmp/my_temp339c944d
   *
   * Requires `allow-write` permission. */
  // TODO(ry) Doesn't check permissions.
  export function makeTempDirSync(options?: MakeTempOptions): string;

  /** Creates a new temporary directory in the default directory for temporary
   * files (see also `Deno.dir("temp")`), unless `dir` is specified.  Other
   * optional options include prefixing and suffixing the directory name with
   * `prefix` and `suffix` respectively.
   *
   * This call resolves to the full path to the newly created directory.
   *
   * Multiple programs calling this function simultaneously will create different
   * directories. It is the caller's responsibility to remove the directory when
   * no longer needed.
   *
   *       const tempDirName0 = await Deno.makeTempDir();  // e.g. /tmp/2894ea76
   *       const tempDirName1 = await Deno.makeTempDir({ prefix: 'my_temp' }); // e.g. /tmp/my_temp339c944d
   *
   * Requires `allow-write` permission. */
  // TODO(ry) Doesn't check permissions.
  export function makeTempDir(options?: MakeTempOptions): Promise<string>;

  /** 以同步的方式在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 如果没有指定 `dir` ，那么 `prefix` 和 `suffx` 将分别是文件名前缀和后缀。
   *
   * 返回新建文件的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tempFileName0 = Deno.makeTempFileSync(); // e.g. /tmp/419e0bf2
   *       const tempFileName1 = Deno.makeTempFileSync({ prefix: 'my_temp' });  //e.g. /tmp/my_temp754d3098
   *
   * 需要 `allow-write` 权限. */
  export function makeTempFileSync(options?: MakeTempOptions): string;

  /** 在默认文件夹（另见 `Deno.dir("temp")`）中创建一个临时文件,
   * 如果指定了 `dir` ， 则在指定的 `dir` 中创建。
   * 如果没有指定 `dir` ，那么 `prefix` 和 `suffx` 将分别是文件名前缀和后缀。
   *
   * 返回新建文件的完整路径。
   *
   * 多个程序同时调用该函数将会创建不同的文件。当不再需要该临时文件时，调用者应该主动删除该文件。
   *
   *       const tmpFileName0 = await Deno.makeTempFile();  // e.g. /tmp/419e0bf2
   *       const tmpFileName1 = await Deno.makeTempFile({ prefix: 'my_temp' });  //e.g. /tmp/my_temp754d3098
   *
   * 需要 `allow-write` 权限. */
  export function makeTempFile(options?: MakeTempOptions): Promise<string>;

  /** Synchronously changes the permission of a specific file/directory of
   * specified path.  Ignores the process's umask.
   *
   *       Deno.chmodSync("/path/to/file", 0o666);
   *
   * For a full description, see [chmod](#chmod)
   *
   * NOTE: This API currently throws on Windows
   *
   * Requires `allow-write` permission. */
  export function chmodSync(path: string, mode: number): void;

  /** Changes the permission of a specific file/directory of specified path.
   * Ignores the process's umask.
   *
   *       await Deno.chmod("/path/to/file", 0o666);
   *
   * The mode is a sequence of 3 octal numbers.  The first/left-most number
   * specifies the permissions for the owner.  The second number specifies the
   * permissions for the group. The last/right-most number specifies the
   * permissions for others.  For example, with a mode of 0o764, the owner (7) can
   * read/write/execute, the group (6) can read/write and everyone else (4) can
   * read only.
   *
   * | Number | Description |
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
   * NOTE: This API currently throws on Windows
   *
   * Requires `allow-write` permission. */
  export function chmod(path: string, mode: number): Promise<void>;

  /** Synchronously change owner of a regular file or directory. This functionality
   * is not available on Windows.
   *
   *      Deno.chownSync("myFile.txt", 1000, 1002);
   *
   * Requires `allow-write` permission.
   *
   * Throws Error (not implemented) if executed on Windows
   *
   * @param path path to the file
   * @param uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   */
  export function chownSync(path: string, uid: number, gid: number): void;

  /** Change owner of a regular file or directory. This functionality
   * is not available on Windows.
   *
   *      await Deno.chown("myFile.txt", 1000, 1002);
   *
   * Requires `allow-write` permission.
   *
   * Throws Error (not implemented) if executed on Windows
   *
   * @param path path to the file
   * @param uid user id (UID) of the new owner
   * @param gid group id (GID) of the new owner
   */
  export function chown(path: string, uid: number, gid: number): Promise<void>;

  /** **UNSTABLE**: needs investigation into high precision time.
   *
   * Synchronously changes the access (`atime`) and modification (`mtime`) times
   * of a file system object referenced by `path`. Given times are either in
   * seconds (UNIX epoch time) or as `Date` objects.
   *
   *       Deno.utimeSync("myfile.txt", 1556495550, new Date());
   *
   * Requires `allow-write` permission. */
  export function utimeSync(
    path: string,
    atime: number | Date,
    mtime: number | Date
  ): void;

  /** **UNSTABLE**: needs investigation into high precision time.
   *
   * Changes the access (`atime`) and modification (`mtime`) times of a file
   * system object referenced by `path`. Given times are either in seconds
   * (UNIX epoch time) or as `Date` objects.
   *
   *       await Deno.utime("myfile.txt", 1556495550, new Date());
   *
   * Requires `allow-write` permission. */
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

  /** Synchronously renames (moves) `oldpath` to `newpath`. Paths may be files or
   * directories.  If `newpath` already exists and is not a directory,
   * `renameSync()` replaces it. OS-specific restrictions may apply when
   * `oldpath` and `newpath` are in different directories.
   *
   *       Deno.renameSync("old/path", "new/path");
   *
   * On Unix, this operation does not follow symlinks at either path.
   *
   * It varies between platforms when the operation throws errors, and if so what
   * they are. It's always an error to rename anything to a non-empty directory.
   *
   * Requires `allow-read` and `allow-write` permissions. */
  export function renameSync(oldpath: string, newpath: string): void;

  /** Renames (moves) `oldpath` to `newpath`.  Paths may be files or directories.
   * If `newpath` already exists and is not a directory, `rename()` replaces it.
   * OS-specific restrictions may apply when `oldpath` and `newpath` are in
   * different directories.
   *
   *       await Deno.rename("old/path", "new/path");
   *
   * On Unix, this operation does not follow symlinks at either path.
   *
   * It varies between platforms when the operation throws errors, and if so what
   * they are. It's always an error to rename anything to a non-empty directory.
   *
   * Requires `allow-read` and `allow-write` permission. */
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

  /** A FileInfo describes a file and is returned by `stat`, `lstat`,
   * `statSync`, `lstatSync`. A list of FileInfo is returned by `readdir`,
   * `readdirSync`. */
  export interface FileInfo {
    /** The size of the file, in bytes. */
    size: number;
    /** The last modification time of the file. This corresponds to the `mtime`
     * field from `stat` on Linux/Mac OS and `ftLastWriteTime` on Windows. This
     * may not be available on all platforms. */
    modified: number | null;
    /** The last access time of the file. This corresponds to the `atime`
     * field from `stat` on Unix and `ftLastAccessTime` on Windows. This may not
     * be available on all platforms. */
    accessed: number | null;
    /** The last access time of the file. This corresponds to the `birthtime`
     * field from `stat` on Mac/BSD and `ftCreationTime` on Windows. This may not
     * be available on all platforms. */
    created: number | null;
    /** The file or directory name. */
    name: string | null;
    /** ID of the device containing the file.
     *
     * _Linux/Mac OS only._ */
    dev: number | null;
    /** Inode number.
     *
     * _Linux/Mac OS only._ */
    ino: number | null;
    /** **UNSTABLE**: Match behavior with Go on Windows for `mode`.
     *
     * The underlying raw `st_mode` bits that contain the standard Unix
     * permissions for this file/directory. */
    mode: number | null;
    /** Number of hard links pointing to this file.
     *
     * _Linux/Mac OS only._ */
    nlink: number | null;
    /** User ID of the owner of this file.
     *
     * _Linux/Mac OS only._ */
    uid: number | null;
    /** User ID of the owner of this file.
     *
     * _Linux/Mac OS only._ */
    gid: number | null;
    /** Device ID of this file.
     *
     * _Linux/Mac OS only._ */
    rdev: number | null;
    /** Blocksize for filesystem I/O.
     *
     * _Linux/Mac OS only._ */
    blksize: number | null;
    /** Number of blocks allocated to the file, in 512-byte units.
     *
     * _Linux/Mac OS only._ */
    blocks: number | null;
    /** Returns whether this is info for a regular file. This result is mutually
     * exclusive to `FileInfo.isDirectory` and `FileInfo.isSymlink`. */
    isFile(): boolean;
    /** Returns whether this is info for a regular directory. This result is
     * mutually exclusive to `FileInfo.isFile` and `FileInfo.isSymlink`. */
    isDirectory(): boolean;
    /** Returns whether this is info for a symlink. This result is
     * mutually exclusive to `FileInfo.isFile` and `FileInfo.isDirectory`. */
    isSymlink(): boolean;
  }

  /** 返回被解析后的符号链接绝对路径。
   *
   *       // 例如: 给定文件 /home/alice/file.txt 和当前目录 /home/alice
   *       Deno.symlinkSync("file.txt", "symlink_file.txt");
   *       const realPath = Deno.realpathSync("./file.txt");
   *       const realSymLinkPath = Deno.realpathSync("./symlink_file.txt");
   *       console.log(realPath);  //输出 "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  //输出 "/home/alice/file.txt"
   *
   * 需要 `allow-read` 权限 */
  export function realpathSync(path: string): string;

  /** 返回被解析后的符号链接绝对路径。
   *
   *       // 例如: 给定文件 /home/alice/file.txt 和当前目录 /home/alice
   *       await Deno.symlink("file.txt", "symlink_file.txt");
   *       const realPath = await Deno.realpath("./file.txt");
   *       const realSymLinkPath = await Deno.realpath("./symlink_file.txt");
   *       console.log(realPath);  // outputs "/home/alice/file.txt"
   *       console.log(realSymLinkPath);  //outputs "/home/alice/file.txt"
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

  /** **UNSTABLE**: Should not have same name as `window.location` type. */
  interface Location {
    /** The full url for the module, e.g. `file://some/file.ts` or
     * `https://some/file.ts`. */
    filename: string;
    /** The line number in the file. It is assumed to be 1-indexed. */
    line: number;
    /** The column number in the file. It is assumed to be 1-indexed. */
    column: number;
  }

  /** UNSTABLE: new API, yet to be vetted.
   *
   * Given a current location in a module, lookup the source location and return
   * it.
   *
   * When Deno transpiles code, it keep source maps of the transpiled code. This
   * function can be used to lookup the original location. This is
   * automatically done when accessing the `.stack` of an error, or when an
   * uncaught error is logged. This function can be used to perform the lookup
   * for creating better error handling.
   *
   * **Note:** `line` and `column` are 1 indexed, which matches display
   * expectations, but is not typical of most index numbers in Deno.
   *
   * An example:
   *
   *       const orig = Deno.applySourceMap({
   *         location: "file://my/module.ts",
   *         line: 5,
   *         column: 15
   *       });
   *       console.log(`${orig.filename}:${orig.line}:${orig.column}`);
   */
  export function applySourceMap(location: Location): Location;

  /** A set of error constructors that are raised by Deno APIs. */
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
   *       //truncate the entire file
   *       Deno.truncateSync("my_file.txt");
   *
   *       //truncate part of the file
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
   *       //truncate the entire file
   *       await Deno.truncate("my_file.txt");
   *
   *       //truncate part of the file
   *       const file = await Deno.makeTempFile();
   *       await Deno.writeFile(file, new TextEncoder().encode("Hello World"));
   *       await Deno.truncate(file, 7);
   *       const data = await Deno.readFile(file);
   *       console.log(new TextDecoder().decode(data));  //"Hello W"
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

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * Open and initalize a plugin.
   *
   *        const plugin = Deno.openPlugin("./path/to/some/plugin.so");
   *        const some_op = plugin.ops.some_op;
   *        const response = some_op.dispatch(new Uint8Array([1,2,3,4]));
   *        console.log(`Response from plugin ${response}`);
   *
   * Requires `allow-plugin` permission. */
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
  /** **UNSTABLE**: Maybe remove `ShutdownMode` entirely.
   *
   * Corresponds to `SHUT_RD`, `SHUT_WR`, `SHUT_RDWR` on POSIX-like systems.
   *
   * See: http://man7.org/linux/man-pages/man2/shutdown.2.html */
  /** **不稳定的**：可能会完全删除 `ShutdownMode`。
   *
   * 对应类 POSIX 系统上的 `SHUT_RD`，`SHUT_WR`，`SHUT_RDWR`。
   *
   * 参阅：http://man7.org/linux/man-pages/man2/shutdown.2.html */
  export enum ShutdownMode {
    Read = 0,
    Write,
    ReadWrite, // TODO(ry) panics on ReadWrite. // TODO(ry) `ReadWrite` 上的异常。
  }

  /** **UNSTABLE**: Both the `how` parameter and `ShutdownMode` enum are under
   * consideration for removal.
   *
   * Shutdown socket send and receive operations.
   *
   * Matches behavior of POSIX shutdown(3).
   *
   *       const listener = Deno.listen({ port: 80 });
   *       const conn = await listener.accept();
   *       Deno.shutdown(conn.rid, Deno.ShutdownMode.Write);
   */
  /** **不稳定的**：参数 `how` 和 枚举 `ShutdownMode` 都在考虑移除。
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

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * A generic transport listener for message-oriented protocols. */
  export interface DatagramConn extends AsyncIterable<[Uint8Array, Addr]> {
    /** **UNSTABLE**: new API, yet to be vetted.
     *
     * Waits for and resolves to the next message to the `UDPConn`. */
    receive(p?: Uint8Array): Promise<[Uint8Array, Addr]>;
    /** UNSTABLE: new API, yet to be vetted.
     *
     * Sends a message to the target. */
    send(p: Uint8Array, addr: Addr): Promise<void>;
    /** UNSTABLE: new API, yet to be vetted.
     *
     * Close closes the socket. Any pending message promises will be rejected
     * with errors. */
    close(): void;
    /** Return the address of the `UDPConn`. */
    readonly addr: Addr;
    [Symbol.asyncIterator](): AsyncIterator<[Uint8Array, Addr]>;
  }

  /** A generic network listener for stream-oriented protocols. */
  export interface Listener extends AsyncIterable<Conn> {
    /** Waits for and resolves to the next connection to the `Listener`. */
    accept(): Promise<Conn>;
    /** Close closes the listener. Any pending accept promises will be rejected
     * with errors. */
    close(): void;
    /** Return the address of the `Listener`. */
    readonly addr: Addr;

    [Symbol.asyncIterator](): AsyncIterator<Conn>;
  }

  export interface Conn extends Reader, Writer, Closer {
    /** The local address of the connection. */
    readonly localAddr: Addr;
    /** The remote address of the connection. */
    readonly remoteAddr: Addr;
    /** The resource ID of the connection. */
    readonly rid: number;
    /** Shuts down (`shutdown(2)`) the reading side of the TCP connection. Most
     * callers should just use `close()`. */
    closeRead(): void;
    /** Shuts down (`shutdown(2)`) the writing side of the TCP connection. Most
     * callers should just use `close()`. */
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
    /** Server certificate file. */
    certFile: string;
    /** Server public key file. */
    keyFile: string;

    transport?: "tcp";
  }

  /** Listen announces on the local transport address over TLS (transport layer
   * security).
   *
   *      const lstnr = Deno.listenTLS({ port: 443, certFile: "./server.crt", keyFile: "./server.key" });
   *
   * Requires `allow-net` permission. */
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
    /** The port to connect to. */
    port: number;
    /** A literal IP address or host name that can be resolved to an IP address.
     * If not specified, defaults to `127.0.0.1`. */
    hostname?: string;
    /** Server certificate file. */
    certFile?: string;
  }

  /** Establishes a secure connection over TLS (transport layer security) using
   * an optional cert file, hostname (default is "127.0.0.1") and port.  The
   * cert file is optional and if not included Mozilla's root certificates will
   * be used (see also https://github.com/ctz/webpki-roots for specifics)
   *
   *     const conn1 = await Deno.connectTLS({ port: 80 });
   *     const conn2 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "192.0.2.1", port: 80 });
   *     const conn3 = await Deno.connectTLS({ hostname: "[2001:db8::1]", port: 80 });
   *     const conn4 = await Deno.connectTLS({ certFile: "./certs/my_custom_root_CA.pem", hostname: "golang.org", port: 80});
   *
   * Requires `allow-net` permission.
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
   *       console.log(Deno.resources()); //e.g. { 0: "stdin", 1: "stdout", 2: "stderr" }
   *       Deno.openSync('../test.file');
   *       console.log(Deno.resources()); //e.g. { 0: "stdin", 1: "stdout", 2: "stderr", 3: "fsFile" }
   */
  export function resources(): ResourceMap;

  /** **不稳定**: 新 API。需要补充文档。 */
  export interface FsEvent {
    kind: "any" | "access" | "create" | "modify" | "remove";
    paths: string[];
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * Watch for file system events against one or more `paths`, which can be files
   * or directories.  These paths must exist already.  One user action (e.g.
   * `touch test.file`) can  generate multiple file system events.  Likewise,
   * one user action can result in multiple file paths in one event (e.g. `mv
   * old_name.txt new_name.txt`).  Recursive option is `true` by default and,
   * for directories, will watch the specified directory and all sub directories.
   * Note that the exact ordering of the events can vary between operating systems.
   *
   *       const iter = Deno.fsEvents("/");
   *       for await (const event of iter) {
   *          console.log(">>>> event", event);  //e.g. { kind: "create", paths: [ "/foo.txt" ] }
   *       }
   *
   * Requires `allow-read` permission.
   */
  export function fsEvents(
    paths: string | string[],
    options?: { recursive: boolean }
  ): AsyncIterableIterator<FsEvent>;

  /** How to handle subprocess stdio.
   *
   * `"inherit"` The default if unspecified. The child inherits from the
   * corresponding parent descriptor.
   *
   * `"piped"` A new pipe should be arranged to connect the parent and child
   * sub-processes.
   *
   * `"null"` This stream will be ignored. This is the equivalent of attaching
   * the stream to `/dev/null`. */
  type ProcessStdio = "inherit" | "piped" | "null";

  /** **UNSTABLE**: The `signo` argument may change to require the Deno.Signal
   * enum.
   *
   * Send a signal to process under given `pid`. This functionality currently
   * only works on Linux and Mac OS.
   *
   * If `pid` is negative, the signal will be sent to the process group
   * identified by `pid`.
   *
   *      const p = Deno.run({
   *        cmd: ["python", "-c", "from time import sleep; sleep(10000)"]
   *      });
   *
   *      Deno.kill(p.pid, Deno.Signal.SIGINT);
   *
   * Throws Error (not yet implemented) on Windows
   *
   * Requires `allow-run` permission. */
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

  /** **UNSTABLE**: The exact form of the string output is under consideration
   * and may change.
   *
   * Converts the input into a string that has the same format as printed by
   * `console.log()`.
   *
   *      const obj = {};
   *      obj.propA = 10;
   *      obj.propB = "hello"
   *      const objAsString = Deno.inspect(obj); //{ propA: 10, propB: "hello" }
   *      console.log(obj);  //prints same value as objAsString, e.g. { propA: 10, propB: "hello" }
   *
   * You can also register custom inspect functions, via the `customInspect` Deno
   * symbol on objects, to control and customize the output.
   *
   *      class A {
   *        x = 10;
   *        y = "hello";
   *        [Deno.symbols.customInspect](): string {
   *          return "x=" + this.x + ", y=" + this.y;
   *        }
   *      }
   *
   *      const inStringFormat = Deno.inspect(new A()); //"x=10, y=hello"
   *      console.log(inStringFormat);  //prints "x=10, y=hello"
   *
   * Finally, a number of output options are also available.
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

  /** The log category for a diagnostic message. */
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
    /** A string message summarizing the diagnostic. */
    message: string;
    /** An ordered array of further diagnostics. */
    messageChain?: DiagnosticMessageChain;
    /** Information related to the diagnostic. This is present when there is a
     * suggestion or other additional diagnostic information */
    relatedInformation?: DiagnosticItem[];
    /** The text of the source line related to the diagnostic. */
    sourceLine?: string;
    /** The line number that is related to the diagnostic. */
    lineNumber?: number;
    /** The name of the script resource related to the diagnostic. */
    scriptResourceName?: string;
    /** The start position related to the diagnostic. */
    startPosition?: number;
    /** The end position related to the diagnostic. */
    endPosition?: number;
    /** The category of the diagnostic. */
    category: DiagnosticCategory;
    /** A number identifier. */
    code: number;
    /** The the start column of the sourceLine related to the diagnostic. */
    startColumn?: number;
    /** The end column of the sourceLine related to the diagnostic. */
    endColumn?: number;
  }

  export interface Diagnostic {
    /** An array of diagnostic items. */
    items: DiagnosticItem[];
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * Format an array of diagnostic items and return them as a single string in a
   * user friendly format.
   *
   *       const [diagnostics, result] = Deno.compile("file_with_compile_issues.ts");
   *       console.table(diagnostics);  //Prints raw diagnostic data
   *       console.log(Deno.formatDiagnostics(diagnostics));  //User friendly output of diagnostics
   *
   * @param items An array of diagnostic items to format
   */
  export function formatDiagnostics(items: DiagnosticItem[]): string;

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * A specific subset TypeScript compiler options that can be supported by the
   * Deno TypeScript compiler. */
  export interface CompilerOptions {
    /** Allow JavaScript files to be compiled. Defaults to `true`. */
    allowJs?: boolean;
    /** Allow default imports from modules with no default export. This does not
     * affect code emit, just typechecking. Defaults to `false`. */
    allowSyntheticDefaultImports?: boolean;
    /** Allow accessing UMD globals from modules. Defaults to `false`. */
    allowUmdGlobalAccess?: boolean;
    /** Do not report errors on unreachable code. Defaults to `false`. */
    allowUnreachableCode?: boolean;
    /** Do not report errors on unused labels. Defaults to `false` */
    allowUnusedLabels?: boolean;
    /** Parse in strict mode and emit `"use strict"` for each source file.
     * Defaults to `true`. */
    alwaysStrict?: boolean;
    /** Base directory to resolve non-relative module names. Defaults to
     * `undefined`. */
    baseUrl?: string;
    /** Report errors in `.js` files. Use in conjunction with `allowJs`. Defaults
     * to `false`. */
    checkJs?: boolean;
    /** Generates corresponding `.d.ts` file. Defaults to `false`. */
    declaration?: boolean;
    /** Output directory for generated declaration files. */
    declarationDir?: string;
    /** Generates a source map for each corresponding `.d.ts` file. Defaults to
     * `false`. */
    declarationMap?: boolean;
    /** Provide full support for iterables in `for..of`, spread and
     * destructuring when targeting ES5 or ES3. Defaults to `false`. */
    downlevelIteration?: boolean;
    /** Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files.
     * Defaults to `false`. */
    emitBOM?: boolean;
    /** Only emit `.d.ts` declaration files. Defaults to `false`. */
    emitDeclarationOnly?: boolean;
    /** Emit design-type metadata for decorated declarations in source. See issue
     * [microsoft/TypeScript#2577](https://github.com/Microsoft/TypeScript/issues/2577)
     * for details. Defaults to `false`. */
    emitDecoratorMetadata?: boolean;
    /** Emit `__importStar` and `__importDefault` helpers for runtime babel
     * ecosystem compatibility and enable `allowSyntheticDefaultImports` for type
     * system compatibility. Defaults to `true`. */
    esModuleInterop?: boolean;
    /** Enables experimental support for ES decorators. Defaults to `false`. */
    experimentalDecorators?: boolean;
    /** Emit a single file with source maps instead of having a separate file.
     * Defaults to `false`. */
    inlineSourceMap?: boolean;
    /** Emit the source alongside the source maps within a single file; requires
     * `inlineSourceMap` or `sourceMap` to be set. Defaults to `false`. */
    inlineSources?: boolean;
    /** Perform additional checks to ensure that transpile only would be safe.
     * Defaults to `false`. */
    isolatedModules?: boolean;
    /** Support JSX in `.tsx` files: `"react"`, `"preserve"`, `"react-native"`.
     * Defaults to `"react"`. */
    jsx?: "react" | "preserve" | "react-native";
    /** Specify the JSX factory function to use when targeting react JSX emit,
     * e.g. `React.createElement` or `h`. Defaults to `React.createElement`. */
    jsxFactory?: string;
    /** Resolve keyof to string valued property names only (no numbers or
     * symbols). Defaults to `false`. */
    keyofStringsOnly?: string;
    /** Emit class fields with ECMAScript-standard semantics. Defaults to `false`.
     * Does not apply to `"esnext"` target. */
    useDefineForClassFields?: boolean;
    /** List of library files to be included in the compilation. If omitted,
     * then the Deno main runtime libs are used. */
    lib?: string[];
    /** The locale to use to show error messages. */
    locale?: string;
    /** Specifies the location where debugger should locate map files instead of
     * generated locations. Use this flag if the `.map` files will be located at
     * run-time in a different location than the `.js` files. The location
     * specified will be embedded in the source map to direct the debugger where
     * the map files will be located. Defaults to `undefined`. */
    mapRoot?: string;
    /** Specify the module format for the emitted code. Defaults to
     * `"esnext"`. */
    module?:
      | "none"
      | "commonjs"
      | "amd"
      | "system"
      | "umd"
      | "es6"
      | "es2015"
      | "esnext";
    /** Do not generate custom helper functions like `__extends` in compiled
     * output. Defaults to `false`. */
    noEmitHelpers?: boolean;
    /** Report errors for fallthrough cases in switch statement. Defaults to
     * `false`. */
    noFallthroughCasesInSwitch?: boolean;
    /** Raise error on expressions and declarations with an implied any type.
     * Defaults to `true`. */
    noImplicitAny?: boolean;
    /** Report an error when not all code paths in function return a value.
     * Defaults to `false`. */
    noImplicitReturns?: boolean;
    /** Raise error on `this` expressions with an implied `any` type. Defaults to
     * `true`. */
    noImplicitThis?: boolean;
    /** Do not emit `"use strict"` directives in module output. Defaults to
     * `false`. */
    noImplicitUseStrict?: boolean;
    /** Do not add triple-slash references or module import targets to the list of
     * compiled files. Defaults to `false`. */
    noResolve?: boolean;
    /** Disable strict checking of generic signatures in function types. Defaults
     * to `false`. */
    noStrictGenericChecks?: boolean;
    /** Report errors on unused locals. Defaults to `false`. */
    noUnusedLocals?: boolean;
    /** Report errors on unused parameters. Defaults to `false`. */
    noUnusedParameters?: boolean;
    /** Redirect output structure to the directory. This only impacts
     * `Deno.compile` and only changes the emitted file names. Defaults to
     * `undefined`. */
    outDir?: string;
    /** List of path mapping entries for module names to locations relative to the
     * `baseUrl`. Defaults to `undefined`. */
    paths?: Record<string, string[]>;
    /** Do not erase const enum declarations in generated code. Defaults to
     * `false`. */
    preserveConstEnums?: boolean;
    /** Remove all comments except copy-right header comments beginning with
     * `/*!`. Defaults to `true`. */
    removeComments?: boolean;
    /** Include modules imported with `.json` extension. Defaults to `true`. */
    resolveJsonModule?: boolean;
    /** Specifies the root directory of input files. Only use to control the
     * output directory structure with `outDir`. Defaults to `undefined`. */
    rootDir?: string;
    /** List of _root_ folders whose combined content represent the structure of
     * the project at runtime. Defaults to `undefined`. */
    rootDirs?: string[];
    /** Generates corresponding `.map` file. Defaults to `false`. */
    sourceMap?: boolean;
    /** Specifies the location where debugger should locate TypeScript files
     * instead of source locations. Use this flag if the sources will be located
     * at run-time in a different location than that at design-time. The location
     * specified will be embedded in the sourceMap to direct the debugger where
     * the source files will be located. Defaults to `undefined`. */
    sourceRoot?: string;
    /** Enable all strict type checking options. Enabling `strict` enables
     * `noImplicitAny`, `noImplicitThis`, `alwaysStrict`, `strictBindCallApply`,
     * `strictNullChecks`, `strictFunctionTypes` and
     * `strictPropertyInitialization`. Defaults to `true`. */
    strict?: boolean;
    /** Enable stricter checking of the `bind`, `call`, and `apply` methods on
     * functions. Defaults to `true`. */
    strictBindCallApply?: boolean;
    /** Disable bivariant parameter checking for function types. Defaults to
     * `true`. */
    strictFunctionTypes?: boolean;
    /** Ensure non-undefined class properties are initialized in the constructor.
     * This option requires `strictNullChecks` be enabled in order to take effect.
     * Defaults to `true`. */
    strictPropertyInitialization?: boolean;
    /** In strict null checking mode, the `null` and `undefined` values are not in
     * the domain of every type and are only assignable to themselves and `any`
     * (the one exception being that `undefined` is also assignable to `void`). */
    strictNullChecks?: boolean;
    /** Suppress excess property checks for object literals. Defaults to
     * `false`. */
    suppressExcessPropertyErrors?: boolean;
    /** Suppress `noImplicitAny` errors for indexing objects lacking index
     * signatures. */
    suppressImplicitAnyIndexErrors?: boolean;
    /** Specify ECMAScript target version. Defaults to `esnext`. */
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
    /** List of names of type definitions to include. Defaults to `undefined`.
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

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * The results of a transpile only command, where the `source` contains the
   * emitted source, and `map` optionally contains the source map. */
  export interface TranspileOnlyResult {
    source: string;
    map?: string;
  }

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * Takes a set of TypeScript sources and resolves to a map where the key was
   * the original file name provided in sources and the result contains the
   * `source` and optionally the `map` from the transpile operation. This does no
   * type checking and validation, it effectively "strips" the types from the
   * file.
   *
   *      const results =  await Deno.transpileOnly({
   *        "foo.ts": `const foo: string = "foo";`
   *      });
   *
   * @param sources A map where the key is the filename and the value is the text
   *                to transpile. The filename is only used in the transpile and
   *                not resolved, for example to fill in the source name in the
   *                source map.
   * @param options An option object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
   *                Many of the options related to type checking and emitting
   *                type declaration files will have no impact on the output.
   */
  export function transpileOnly(
    sources: Record<string, string>,
    options?: CompilerOptions
  ): Promise<Record<string, TranspileOnlyResult>>;

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * Takes a root module name, and optionally a record set of sources. Resolves
   * with a compiled set of modules and possibly diagnostics if the compiler
   * encountered any issues. If just a root name is provided, the modules
   * will be resolved as if the root module had been passed on the command line.
   *
   * If sources are passed, all modules will be resolved out of this object, where
   * the key is the module name and the value is the content. The extension of
   * the module name will be used to determine the media type of the module.
   *
   *      const [ maybeDiagnostics1, output1 ] = await Deno.compile("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.compile("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName The root name of the module which will be used as the
   *                 "starting point". If no `sources` is specified, Deno will
   *                 resolve the module externally as if the `rootName` had been
   *                 specified on the command line.
   * @param sources An optional key/value map of sources to be used when resolving
   *                modules, where the key is the module name, and the value is
   *                the source content. The extension of the key will determine
   *                the media type of the file when processing. If supplied,
   *                Deno will not attempt to resolve any modules externally.
   * @param options An optional object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
   */
  export function compile(
    rootName: string,
    sources?: Record<string, string>,
    options?: CompilerOptions
  ): Promise<[DiagnosticItem[] | undefined, Record<string, string>]>;

  /** **UNSTABLE**: new API, yet to be vetted.
   *
   * `bundle()` is part the compiler API.  A full description of this functionality
   * can be found in the [manual](https://deno.land/std/manual.md#denobundle).
   *
   * Takes a root module name, and optionally a record set of sources. Resolves
   * with a single JavaScript string (and bundle diagnostics if issues arise with
   * the bundling) that is like the output of a `deno bundle` command. If just
   * a root name is provided, the modules will be resolved as if the root module
   * had been passed on the command line.
   *
   * If sources are passed, all modules will be resolved out of this object, where
   * the key is the module name and the value is the content. The extension of the
   * module name will be used to determine the media type of the module.
   *
   *      //equivalent to "deno bundle foo.ts" from the command line
   *      const [ maybeDiagnostics1, output1 ] = await Deno.bundle("foo.ts");
   *
   *      const [ maybeDiagnostics2, output2 ] = await Deno.bundle("/foo.ts", {
   *        "/foo.ts": `export * from "./bar.ts";`,
   *        "/bar.ts": `export const bar = "bar";`
   *      });
   *
   * @param rootName The root name of the module which will be used as the
   *                 "starting point". If no `sources` is specified, Deno will
   *                 resolve the module externally as if the `rootName` had been
   *                 specified on the command line.
   * @param sources An optional key/value map of sources to be used when resolving
   *                modules, where the key is the module name, and the value is
   *                the source content. The extension of the key will determine
   *                the media type of the file when processing. If supplied,
   *                Deno will not attempt to resolve any modules externally.
   * @param options An optional object of options to send to the compiler. This is
   *                a subset of ts.CompilerOptions which can be supported by Deno.
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
