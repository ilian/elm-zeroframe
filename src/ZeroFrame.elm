module ZeroFrame exposing (..)

import Native.ZeroFrame
import Task exposing (Task)

{-| -}
certSelect : msg -> List String -> Cmd msg
certSelect msg acceptedDomains =
    noPayloadTaskToCmd msg <| Native.ZeroFrame.cmd "certSelect" { accepted_domains = acceptedDomains }


{-| -}
dbQuery : String -> List String -> Task String (List String)
dbQuery =
    Native.ZeroFrame.cmd


{-| -}
type WrapperNotificationType = Info | Error | Done

{-| -}
wrapperNotification : msg -> WrapperNotificationType -> String -> Maybe Int -> Cmd msg
wrapperNotification msg t message timeout =
    let
        st = (String.toLower << toString) t
    in
        noPayloadTaskToCmd msg <|
            case timeout of
                 -- Tuple will be converted as a mixed-type JS array
                 Just a -> Native.ZeroFrame.cmd "wrapperNotification" (st, message, a)
                 Nothing -> Native.ZeroFrame.cmd "wrapperNotification" [st, message]

{-| -}
wrapperSetTitle : msg -> String -> Cmd msg
wrapperSetTitle msg =
    noPayloadTaskToCmd msg << Native.ZeroFrame.cmd "wrapperSetTitle"


{-| -}
wrapperSetViewport : msg -> String -> Cmd msg
wrapperSetViewport msg =
    noPayloadTaskToCmd msg << Native.ZeroFrame.cmd "wrapperSetViewport"


-- UTILS


noPayloadTaskToCmd : msg -> Task Never () -> Cmd msg
noPayloadTaskToCmd msg =
    Task.perform (always msg)
