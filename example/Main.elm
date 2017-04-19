import ZeroFrame exposing (wrapperSetTitle)
import Html exposing (program, text)

type Msg = NoOp

main = program
       { init = ("",  ZeroFrame.certSelect NoOp ["zeroid.bit"])
       , update =
          \action model -> "" ! []
       , view =
          \model ->
             text "This page should ask for a user certificate."
       , subscriptions = \_ -> Sub.none
       }
