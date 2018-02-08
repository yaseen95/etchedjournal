package com.etchedjournal.etched.security

import com.etchedjournal.etched.repository.EtchedUserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

/**
 * Impl of UserDetailsService used by Spring to fetch UserDetails by username.
 */
@Service
class SecurityUserService : UserDetailsService {

    @Autowired
    lateinit var etchedUserRepository: EtchedUserRepository

    @Throws(UsernameNotFoundException::class)
    override fun loadUserByUsername(username: String): UserDetails? {
        val etchedUser = etchedUserRepository.findByUsername(username)

        if (etchedUser != null) {
            val authorities = HashSet<GrantedAuthority>()
            authorities.add(SimpleGrantedAuthority("USER"))
            if (etchedUser.admin) {
                authorities.add(SimpleGrantedAuthority("ADMIN"))
            }
            return SecurityUser(username, etchedUser.password, authorities)
        }
        return null
    }
}
