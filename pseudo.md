- accept request

  - check KV for state (open, closed, half-open)

    - if closed, request is forward to third party

      - check whether request takes longer than defined timeout value
        - add to KV as network error
        - check for failure threshhold
          - change state if necessary
        - return failure message 

      - check whether response is 500 level
        - add to KV as service error
        - check for failure threshhold
          - change state if necessary
        - return failure message 

      - response is successful and on time
        - forward response

    - if open, check time open to see whether state should change to half-open

      - if state should be still open
        - immediately send failure back

      - if state should be half-open
        - change state to half-open 
        - go to half-open state path

    - if state is half-open

      - determine whether or not to block request (randomizer)

        - if blocked, send back immediate failure

        - if not blocked, send request to third party
        
          - if successful 
            - write to KV as success request
            - query KV to check recent request statuses
              - write to change KV state to closed if metric met
            - forward the response

          - if failed
            - write to KV as failed request
            - query KV to check recent request statuses (?)
              - write to change KV state to open if metric met
            - return failure message 
